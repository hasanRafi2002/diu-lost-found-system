import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardMedia,
  CardContent,
  Grid,
  TextField,
  Paper,
  Chip,
  Skeleton,
  useTheme,
} from "@mui/material";
import { Search, MapPin, CheckCircle2, Bell, Zap, Users, ShieldCheck, ArrowRight } from "lucide-react";
import LottiePlayer from "../components/LottiePlayer";
import searchAnimation from "../animations/search.json";
import { listItems } from "../services/itemService";
import Footer from "../components/Footer";

const QUICK_ACTIONS = [
  { Icon: MapPin, title: "Report Lost Item", desc: "Tell the community about something you lost", path: "/report" },
  { Icon: CheckCircle2, title: "Report Found Item", desc: "Help return something you found", path: "/report" },
  { Icon: Bell, title: "Browse Items", desc: "See all lost & found items", path: "/lost" },
];

const HOW_IT_WORKS = [
  { Icon: Zap, title: "Report Quickly", desc: "Post details about lost/found items in seconds with photos" },
  { Icon: Users, title: "Get Community Help", desc: "Community members verify and claim items" },
  { Icon: ShieldCheck, title: "Verify & Reunite", desc: "Approve claims and reunite with owners" },
];

export default function Home() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentItems();
  }, []);

  async function loadRecentItems() {
    try {
      const response = await listItems({ page: 1, page_size: 6 });
      setRecentItems(response.items || []);
    } catch (err) {
      console.error("Error loading items:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/lost?search=${encodeURIComponent(searchTerm)}`);
    }
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Hero */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 55%, ${theme.palette.secondary.main} 130%)`,
          color: "white",
          py: { xs: 7, md: 11 },
          px: 2,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} sx={{ alignItems: "center" }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Chip
                label="DIU Community Platform"
                size="small"
                sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "white", fontWeight: 600, mb: 2 }}
              />
              <Typography
                variant="h2"
                sx={{ mb: 2, fontSize: { xs: "2.2rem", md: "3.25rem" }, fontWeight: 800, lineHeight: 1.15 }}
              >
                Lost something?
                <br /> Let's find it together.
              </Typography>
              <Typography
                variant="h6"
                sx={{ mb: 4, opacity: 0.92, fontSize: { xs: "1rem", md: "1.15rem" }, fontWeight: 400, maxWidth: 480 }}
              >
                DIU Lost & Found connects students and staff to reunite belongings across campus — fast, simple, verified.
              </Typography>

              <Box
                component="form"
                onSubmit={handleSearch}
                sx={{ display: "flex", gap: 1, mb: 3, flexDirection: { xs: "column", sm: "row" } }}
              >
                <TextField
                  fullWidth
                  placeholder="Search lost or found items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": { backgroundColor: "white", borderRadius: 2, color: "black" },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Search size={18} />}
                  sx={{
                    backgroundColor: "white",
                    color: theme.palette.primary.main,
                    fontWeight: 700,
                    px: 3,
                    borderRadius: 2,
                    whiteSpace: "nowrap",
                    "&:hover": { backgroundColor: "#f3f4f6" },
                  }}
                >
                  Search
                </Button>
              </Box>

              <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    backgroundColor: theme.palette.secondary.main,
                    color: "white",
                    borderRadius: 2,
                    fontWeight: 600,
                    "&:hover": { backgroundColor: theme.palette.secondary.dark },
                  }}
                  onClick={() => navigate("/report")}
                >
                  Report Lost Item
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    color: "white",
                    borderColor: "rgba(255,255,255,0.6)",
                    borderRadius: 2,
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.1)", borderColor: "white" },
                  }}
                  onClick={() => navigate("/report")}
                >
                  Report Found Item
                </Button>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }} sx={{ display: "flex", justifyContent: "center" }}>
              <Box sx={{ width: { xs: 240, sm: 320, md: 380 } }}>
                <LottiePlayer animationData={searchAnimation} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Quick Actions */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Grid container spacing={3}>
          {QUICK_ACTIONS.map(({ Icon, title, desc, path }, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  p: 4,
                  textAlign: "center",
                  cursor: "pointer",
                  borderRadius: 3,
                  transition: "all 0.25s",
                  "&:hover": { boxShadow: 8, transform: "translateY(-6px)" },
                }}
                onClick={() => navigate(path)}
              >
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "primary.50",
                    color: "primary.main",
                    mb: 2,
                  }}
                >
                  <Icon size={28} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{title}</Typography>
                <Typography variant="body2" color="textSecondary">{desc}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How It Works */}
      <Box sx={{ backgroundColor: theme.palette.mode === "dark" ? "#1e293b" : "#f9fafb", py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ textAlign: "center", mb: 6, fontWeight: 800 }}>
            How It Works
          </Typography>
          <Grid container spacing={4}>
            {HOW_IT_WORKS.map(({ Icon, title, desc }, i) => (
              <Grid size={{ xs: 12, md: 4 }} key={i}>
                <Card sx={{ p: 3, textAlign: "center", height: "100%", borderRadius: 3 }}>
                  <Box sx={{ color: "primary.main", mb: 1.5 }}>
                    <Icon size={36} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{title}</Typography>
                  <Typography variant="body2" color="textSecondary">{desc}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Recent Items */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 }, flex: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 800 }}>Recent Reports</Typography>
          <Button color="primary" endIcon={<ArrowRight size={16} />} onClick={() => navigate("/lost")}>
            View All
          </Button>
        </Box>

        {loading ? (
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <Card sx={{ borderRadius: 3 }}>
                  <Skeleton variant="rectangular" height={200} />
                  <CardContent>
                    <Skeleton width="80%" />
                    <Skeleton width="100%" />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : recentItems.length > 0 ? (
          <Grid container spacing={3}>
            {recentItems.map((item) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
                <Card
                  sx={{
                    cursor: "pointer",
                    borderRadius: 3,
                    overflow: "hidden",
                    transition: "all 0.25s",
                    "&:hover": { boxShadow: 8, transform: "translateY(-4px)" },
                  }}
                  onClick={() => navigate(`/items/${item.id}`)}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={item.image_url || "https://via.placeholder.com/400x200?text=No+Image"}
                    alt={item.title}
                    sx={{ objectFit: "cover" }}
                  />
                  <CardContent>
                    <Box sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap" }}>
                      <Chip
                        label={item.item_type}
                        size="small"
                        color={item.item_type === "LOST" ? "error" : "info"}
                        variant="outlined"
                      />
                      <Chip label={item.status} size="small" variant="outlined" />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>{item.title}</Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                    >
                      {item.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
            <Typography color="textSecondary">
              No items reported yet. Be the first to help the community!
            </Typography>
          </Paper>
        )}
      </Container>

      <Footer />
    </Box>
  );
}
