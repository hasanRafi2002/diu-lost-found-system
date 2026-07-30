import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Search,
  MapPin,
  CheckCircle2,
  PlusCircle,
  Phone,
  Moon,
  Sun,
  Menu as MenuIcon,
  X as CloseIcon,
  User,
  LayoutDashboard,
  LogOut,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme as useThemeContext } from "../context/ThemeContext";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { isDarkMode, toggleTheme } = useThemeContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const menuItems = [
    { label: "Lost Items", path: "/lost", Icon: MapPin },
    { label: "Found Items", path: "/found", Icon: CheckCircle2 },
    { label: "Report Item", path: "/report", Icon: PlusCircle },
    { label: "Contact", path: "/contact", Icon: Phone },
  ];

  return (
    <AppBar position="sticky" elevation={0} sx={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
      <Toolbar sx={{ py: 1, gap: 1 }}>
        <Box
          onClick={() => navigate("/")}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontWeight: 800,
            fontSize: "1.25rem",
            cursor: "pointer",
            mr: 4,
          }}
        >
          <Search size={22} strokeWidth={2.5} />
          DIU Lost & Found
        </Box>

        {!isMobile && (
          <Box sx={{ display: "flex", gap: 0.5, flex: 1 }}>
            {menuItems.map(({ label, path, Icon }) => (
              <Button
                key={path}
                color="inherit"
                startIcon={<Icon size={17} />}
                onClick={() => navigate(path)}
                sx={{ textTransform: "none", fontSize: "0.925rem", fontWeight: 500 }}
              >
                {label}
              </Button>
            ))}
          </Box>
        )}

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, ml: "auto" }}>
          <IconButton onClick={toggleTheme} color="inherit" size="small">
            {isDarkMode ? <Sun size={19} /> : <Moon size={19} />}
          </IconButton>

          {isAuthenticated && <NotificationBell />}

          {isAuthenticated ? (
            <>
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small" sx={{ ml: 0.5 }}>
                <Avatar
                  src={user?.profile_image || undefined}
                  sx={{ width: 32, height: 32, fontSize: "0.9rem", bgcolor: "secondary.main" }}
                >
                  {!user?.profile_image && user?.full_name?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>

              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                <MenuItem onClick={() => { navigate("/profile"); setAnchorEl(null); }}>
                  <ListItemIcon><User size={17} /></ListItemIcon> Profile
                </MenuItem>
                <MenuItem onClick={() => { navigate("/my-reports"); setAnchorEl(null); }}>
                  <ListItemIcon><FileText size={17} /></ListItemIcon> My Reports
                </MenuItem>
                {user?.role === "ADMIN" && (
                  <MenuItem onClick={() => { navigate("/admin"); setAnchorEl(null); }}>
                    <ListItemIcon><LayoutDashboard size={17} /></ListItemIcon> Admin Panel
                  </MenuItem>
                )}
                <Divider />
                <MenuItem onClick={() => { logout(); setAnchorEl(null); }}>
                  <ListItemIcon><LogOut size={17} /></ListItemIcon> Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button color="inherit" variant="outlined" size="small" onClick={() => navigate("/login")}>
              Login
            </Button>
          )}

          {isMobile && (
            <IconButton onClick={() => setMobileOpen(!mobileOpen)} color="inherit" size="small">
              {mobileOpen ? <CloseIcon size={20} /> : <MenuIcon size={20} />}
            </IconButton>
          )}
        </Box>
      </Toolbar>

      <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <Box sx={{ width: 260, p: 1 }}>
          <List>
            {menuItems.map(({ label, path, Icon }) => (
              <ListItem key={path} disablePadding>
                <ListItemButton onClick={() => { navigate(path); setMobileOpen(false); }}>
                  <ListItemIcon><Icon size={19} /></ListItemIcon>
                  <ListItemText primary={label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}
