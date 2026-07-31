import { useState, useRef } from "react";
import {
  Box,
  Container,
  Card,
  Grid,
  Avatar,
  Typography,
  Button,
  TextField,
  Tabs,
  Tab,
  Paper,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { Pencil, Save, X, Camera } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { updateProfile, uploadAvatar } from "../services/userService";
import { resolveImageUrl } from "../services/uploadService";
import toast from "react-hot-toast";
import Footer from "../components/Footer";

function TabPanel({ children, value, index }) {
  return value === index && <Box>{children}</Box>;
}

export default function Profile() {
  const { user, updateUser } = useAuth();
  const theme = useTheme();
  const fileInputRef = useRef(null);

  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || "",
    phone: user?.phone || "",
    department: user?.department || "",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await updateProfile(profileData);
      updateUser(updated);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setProfileData({
      full_name: user?.full_name || "",
      phone: user?.phone || "",
      department: user?.department || "",
    });
    setIsEditing(false);
  }

  async function handleAvatarSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Only JPG, PNG, or WEBP images are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setUploadingAvatar(true);
    try {
      const updated = await uploadAvatar(file);
      updateUser(updated);
      toast.success("Profile photo updated");
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Upload failed");
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Box sx={{ py: { xs: 4, md: 8 }, flex: 1 }}>
        <Container maxWidth="md">
          <Card sx={{ p: { xs: 3, md: 4 }, mb: 4, borderRadius: 3 }}>
            <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start", mb: 1, flexWrap: "wrap" }}>
              <Box
                sx={{ position: "relative", cursor: "pointer" }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Avatar
                  src={resolveImageUrl(user?.profile_image)}
                  sx={{
                    width: 120,
                    height: 120,
                    fontSize: "3rem",
                    backgroundColor: theme.palette.primary.main,
                  }}
                >
                  {!user?.profile_image && user?.full_name?.charAt(0).toUpperCase()}
                </Avatar>
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    bgcolor: "primary.main",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid white",
                  }}
                >
                  {uploadingAvatar ? <CircularProgress size={16} sx={{ color: "white" }} /> : <Camera size={16} />}
                </Box>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarSelect}
                  className="hidden"
                  style={{ display: "none" }}
                />
              </Box>

              <Box sx={{ flex: 1, minWidth: 200 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {user?.full_name}
                </Typography>
                <Typography color="textSecondary" sx={{ mb: 2 }}>
                  {user?.email}
                </Typography>

                {!isEditing && (
                  <Button
                    variant="outlined"
                    startIcon={<Pencil size={16} />}
                    size="small"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                )}
              </Box>
            </Box>
          </Card>

          <Paper sx={{ mb: 3, borderRadius: 3 }}>
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
              <Tab label="Personal Info" />
              <Tab label="Account Settings" />
            </Tabs>
          </Paper>

          <TabPanel value={tabValue} index={0}>
            <Card sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="full_name"
                    value={profileData.full_name}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="Email" name="email" value={user?.email || ""} disabled />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="Student ID" name="student_id" value={user?.student_id || ""} disabled />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Department"
                    name="department"
                    value={profileData.department}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>

                {isEditing && (
                  <Grid size={{ xs: 12 }} sx={{ display: "flex", gap: 2, mt: 1 }}>
                    <Button
                      variant="contained"
                      startIcon={<Save size={16} />}
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button variant="outlined" startIcon={<X size={16} />} onClick={handleCancel} disabled={saving}>
                      Cancel
                    </Button>
                  </Grid>
                )}
              </Grid>
            </Card>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Card sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Password changes aren't available yet — check back soon.
              </Typography>
            </Card>
          </TabPanel>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
