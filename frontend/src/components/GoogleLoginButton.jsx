import { Button, Box } from "@mui/material";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";

export default function GoogleLoginButton({ onSuccess }) {
  return (
    <Box sx={{ width: "100%" }}>
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          console.log("Google login:", credentialResponse);
          toast.success("Google login successful!");
          onSuccess?.(credentialResponse);
        }}
        onError={() => {
          toast.error("Google login failed");
        }}
      />
    </Box>
  );
}
