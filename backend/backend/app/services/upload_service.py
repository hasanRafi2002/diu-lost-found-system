import io
import os
import uuid
from pathlib import Path

from fastapi import UploadFile, HTTPException, status
from PIL import Image, ImageOps, UnidentifiedImageError
from PIL.Image import DecompressionBombError, DecompressionBombWarning

from app.core.config import settings

UPLOAD_DIR = Path("uploads/items")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

AVATAR_DIR = Path("uploads/avatars")
AVATAR_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_TYPES = {
    image_type.strip().lower()
    for image_type in settings.ALLOWED_IMAGE_TYPES.split(",")
    if image_type.strip()
}

MAX_SIZE_BYTES = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024

# Prevent extremely large images from consuming excessive memory/CPU
# when Pillow decodes them.
MAX_IMAGE_PIXELS = 20_000_000
Image.MAX_IMAGE_PIXELS = MAX_IMAGE_PIXELS


def _get_output_format(content_type: str) -> str:
    if content_type == "image/png":
        return "PNG"
    if content_type == "image/webp":
        return "WEBP"
    return "JPEG"


async def _process_and_save(file: UploadFile, dest_dir: Path, url_prefix: str) -> str:
    content_type = (file.content_type or "").lower()

    # First layer: reject unsupported client-declared MIME types.
    if content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file type.",
        )

    # Read only up to MAX_SIZE_BYTES + 1 so an oversized upload
    # is rejected without unnecessarily reading a huge body into memory.
    contents = await file.read(MAX_SIZE_BYTES + 1)

    if len(contents) > MAX_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Max size: {settings.MAX_UPLOAD_SIZE_MB}MB",
        )

    if not contents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded image is empty.",
        )

    # Second layer: actually decode the file.
    # This prevents a non-image file from simply claiming to be image/png, etc.
    try:
        with Image.open(io.BytesIO(contents)) as image:
            image.verify()

        # Re-open after verify(); verify() invalidates the image object.
        with Image.open(io.BytesIO(contents)) as image:
            if image.width <= 0 or image.height <= 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid image dimensions.",
                )

            if image.width * image.height > MAX_IMAGE_PIXELS:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Image dimensions are too large.",
                )

            # Don't allow animated images for item photos.
            if getattr(image, "n_frames", 1) > 1:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Animated images are not supported.",
                )

            # Normalize EXIF orientation, then create a new image object.
            image = ImageOps.exif_transpose(image)

            if image.mode in ("RGBA", "LA", "P"):
                # JPEG doesn't support transparency.
                if _get_output_format(content_type) == "JPEG":
                    background = Image.new("RGB", image.size, "white")
                    if image.mode == "P":
                        image = image.convert("RGBA")
                    background.paste(
                        image,
                        mask=image.getchannel("A") if "A" in image.getbands() else None,
                    )
                    image = background
                else:
                    image = image.copy()
            else:
                image = image.convert("RGB")

            output_format = _get_output_format(content_type)

            output = io.BytesIO()

            save_kwargs = {
                "format": output_format,
            }

            if output_format == "JPEG":
                save_kwargs.update(
                    {
                        "quality": 85,
                        "optimize": True,
                    }
                )
            elif output_format == "WEBP":
                save_kwargs.update(
                    {
                        "quality": 85,
                        "method": 6,
                    }
                )
            elif output_format == "PNG":
                save_kwargs.update(
                    {
                        "optimize": True,
                    }
                )

            # Re-encoding creates a clean image rather than storing
            # arbitrary bytes supplied by the client.
            image.save(output, **save_kwargs)
            safe_contents = output.getvalue()

    except DecompressionBombError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image is too large to process safely.",
        )
    except (UnidentifiedImageError, OSError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or corrupted image.",
        )

    # Generate our own filename. Never trust the original filename.
    extension = {
        "JPEG": ".jpg",
        "PNG": ".png",
        "WEBP": ".webp",
    }[output_format]

    filename = f"{uuid.uuid4().hex}{extension}"
    filepath = dest_dir / filename

    try:
        with open(filepath, "wb") as output_file:
            output_file.write(safe_contents)
    except OSError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to save uploaded image.",
        )

    return f"{url_prefix}/{filename}"


def delete_item_image(image_url: str | None) -> None:
    if not image_url:
        return

    filename = os.path.basename(image_url)

    # Only operate on files inside the configured upload directory.
    filepath = UPLOAD_DIR / filename

    if filepath.exists() and filepath.is_file():
        try:
            filepath.unlink()
        except OSError:
            # Do not turn an already-completed database operation
            # into a failed request because an old image could not be removed.
            pass


async def save_item_image(file: UploadFile) -> str:
    return await _process_and_save(file, UPLOAD_DIR, "/uploads/items")


async def save_avatar_image(file: UploadFile) -> str:
    return await _process_and_save(file, AVATAR_DIR, "/uploads/avatars")
