import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  Grid,
  Stack,
  useTheme,
} from "@mui/material";
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import Footer from "../components/Footer";

export default function Contact() {
  const theme = useTheme();
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: location.state?.prefillMessage ? "Message from chat widget" : "",
    message: location.state?.prefillMessage || "",
  });
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Connect to backend email service
      console.log("Form submitted:", formData);
      toast.success("Message sent! We'll get back to you soon.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Box sx={{ py: { xs: 4, md: 8 }, flex: 1 }}>
        <Container maxWidth="lg">
          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
              Get In Touch
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 1 }}>
              Have a question or suggestion? We'd love to hear from you!
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {/* Contact Info */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={3}>
                {[
                  {
                    icon: <EmailIcon />,
                    title: "Email",
                    text: "support@diu.edu.bd",
                  },
                  {
                    icon: <PhoneIcon />,
                    title: "Phone",
                    text: "+880-1700-000000",
                  },
                  {
                    icon: <LocationIcon />,
                    title: "Address",
                    text: "Daffodil International University, Dhaka",
                  },
                ].map((item, i) => (
                  <Card key={i} sx={{ p: 3 }}>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Box sx={{ color: "primary.main", pt: 0.5 }}>
                        {item.icon}
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {item.title}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {item.text}
                        </Typography>
                      </Box>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Grid>

            {/* Contact Form */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Card sx={{ p: { xs: 3, md: 4 } }}>
                <Box component="form" onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label="Your Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    margin="normal"
                    required
                  />

                  <TextField
                    fullWidth
                    label="Your Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    margin="normal"
                    required
                  />

                  <TextField
                    fullWidth
                    label="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    margin="normal"
                    required
                  />

                  <TextField
                    fullWidth
                    label="Message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    multiline
                    rows={5}
                    margin="normal"
                    required
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    sx={{ mt: 3 }}
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send Message"}
                  </Button>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
