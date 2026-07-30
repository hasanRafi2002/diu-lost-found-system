import { Box, Container, Typography, Stack, Link, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Mail, Search } from "lucide-react";

function FacebookIcon(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z"/>
    </svg>
  );
}

function TwitterIcon(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.9 2H22l-7.6 8.7L23 22h-6.9l-5.4-6.7L4.4 22H1.3l8.2-9.3L1 2h7l4.9 6.1L18.9 2Zm-1.2 18h1.7L7.4 4H5.6l12.1 16Z"/>
    </svg>
  );
}

function LinkedinIcon(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.86 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z"/>
    </svg>
  );
}

export default function Footer() {
  const navigate = useNavigate();
  const theme = useTheme();

  const linkSx = {
    cursor: "pointer",
    color: "inherit",
    opacity: 0.75,
    fontSize: "0.9rem",
    "&:hover": { opacity: 1 },
    textDecoration: "none",
  };

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.mode === "dark" ? "#0f172a" : "#111827",
        color: "white",
        mt: "auto",
        pt: { xs: 6, md: 8 },
        pb: 4,
      }}
    >
      <Container maxWidth="lg">
        <Stack direction={{ xs: "column", md: "row" }} spacing={4} sx={{ mb: 4 }}>
          <Box sx={{ flex: 1.4 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}
            >
              <Search size={20} /> DIU Lost & Found
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.75, maxWidth: 320 }}>
              Helping our DIU community reunite with lost items and support each other.
            </Typography>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, letterSpacing: 0.4 }}>
              QUICK LINKS
            </Typography>
            <Stack spacing={1}>
              <Link onClick={() => navigate("/lost")} sx={linkSx}>Lost Items</Link>
              <Link onClick={() => navigate("/found")} sx={linkSx}>Found Items</Link>
              <Link onClick={() => navigate("/report")} sx={linkSx}>Report Item</Link>
            </Stack>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, letterSpacing: 0.4 }}>
              SUPPORT
            </Typography>
            <Stack spacing={1}>
              <Link onClick={() => navigate("/contact")} sx={linkSx}>Contact Us</Link>
              <Link href="mailto:support@diu.edu.bd" sx={linkSx}>Email Support</Link>
            </Stack>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, letterSpacing: 0.4 }}>
              FOLLOW US
            </Typography>
            <Stack direction="row" spacing={1.5}>
              {[
                { Icon: FacebookIcon, href: "#" },
                { Icon: TwitterIcon, href: "#" },
                { Icon: LinkedinIcon, href: "#" },
                { Icon: Mail, href: "mailto:support@diu.edu.bd" },
              ].map(({ Icon, href }, i) => (
                <Link
                  key={i}
                  href={href}
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    bgcolor: "rgba(255,255,255,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "inherit",
                    opacity: 0.85,
                    "&:hover": { opacity: 1, bgcolor: "rgba(255,255,255,0.16)" },
                  }}
                >
                  <Icon size={16} />
                </Link>
              ))}
            </Stack>
          </Box>
        </Stack>

        <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.12)", pt: 3, textAlign: "center" }}>
          <Typography variant="body2" sx={{ opacity: 0.65 }}>
            &copy; {new Date().getFullYear()} DIU Lost & Found. All rights reserved.
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.5, display: "block", mt: 0.5 }}>
            Made with ❤️ for Daffodil International University
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
