import { Box, CircularProgress, Typography } from "@mui/material";

export default function LoadingSpinner({ message = "Loading...", minHeight = "400px" }) {
  return (
    <Box sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight,
      gap: 2,
    }}>
      <CircularProgress />
      <Typography color="textSecondary">{message}</Typography>
    </Box>
  );
}
