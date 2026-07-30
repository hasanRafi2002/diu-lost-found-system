import { useState } from "react";
import { Fab, Paper, Box, Typography, IconButton, TextField, Button, Stack, Zoom } from "@mui/material";
import { MessageCircle, X, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

const QUICK_REPLIES = [
  "I lost an item on campus",
  "I found an item and want to report it",
  "I need help with a claim",
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  function goToContact(prefill) {
    setOpen(false);
    navigate("/contact", { state: { prefillMessage: prefill } });
  }

  function handleSend(e) {
    e.preventDefault();
    if (!message.trim()) return;
    goToContact(message.trim());
  }

  return (
    <>
      <Zoom in={!open}>
        <Fab
          color="secondary"
          onClick={() => setOpen(true)}
          sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 1300 }}
        >
          <MessageCircle size={24} />
        </Fab>
      </Zoom>

      <Zoom in={open}>
        <Paper
          elevation={8}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: { xs: "calc(100vw - 32px)", sm: 340 },
            maxWidth: 340,
            borderRadius: 3,
            overflow: "hidden",
            zIndex: 1300,
          }}
        >
          <Box sx={{ bgcolor: "primary.main", color: "white", p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: "0.95rem" }}>Message Us</Typography>
              <Typography sx={{ fontSize: "0.75rem", opacity: 0.85 }}>We usually reply within a day</Typography>
            </Box>
            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: "white" }}>
              <X size={18} />
            </IconButton>
          </Box>

          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 1.5 }}>
              Hi 👋 What can we help with?
            </Typography>

            <Stack spacing={1} sx={{ mb: 2 }}>
              {QUICK_REPLIES.map((q) => (
                <Button
                  key={q}
                  variant="outlined"
                  size="small"
                  onClick={() => goToContact(q)}
                  sx={{ justifyContent: "flex-start", textTransform: "none", borderRadius: 2 }}
                >
                  {q}
                </Button>
              ))}
            </Stack>

            <Box component="form" onSubmit={handleSend} sx={{ display: "flex", gap: 1 }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <IconButton type="submit" color="primary" disabled={!message.trim()}>
                <Send size={18} />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Zoom>
    </>
  );
}
