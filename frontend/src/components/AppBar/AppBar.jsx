import { useState } from "react";
import ModeSelect from "~/components/ModeSelect/ModeSelect";
import Box from "@mui/material/Box";
import AppsIcon from "@mui/icons-material/Apps";
import SvgIcon from "@mui/material/SvgIcon";
import { ReactComponent as TrelloIcon } from "~/assets/trello.svg";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import Profiles from "./Menu/Profiles.jsx";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";

import Notifications from "./Notifications/Notifications";
import CreateBoardModal from "~/components/Modal/CreateBoardModal/CreateBoardModal";
function AppBar({ searchValue, setSearchValue }) {
  // State quản lý modal tạo board
  const [openCreateModal, setOpenCreateModal] = useState(false);

  return (
    <Box
      sx={{
        width: "100%",
        height: (theme) => theme.trello.appBarHeight,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        paddingX: 2,
        overflowX: "auto",
        bgcolor: (theme) =>
          theme.palette.mode === "dark" ? "#2c3e50" : "#1565c0",
      }}
    >
      {/* --- CỘT TRÁI --- */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <AppsIcon sx={{ color: "white" }} fontSize="small" />
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <SvgIcon
            component={TrelloIcon}
            fontSize="medium"
            inheritViewBox
            sx={{ color: "white" }}
          />
          <Typography
            varient="span"
            sx={{ fontSize: "1rem", fontWeight: "bold", color: "white" }}
          >
            Trello
          </Typography>
        </Box>
      </Box>

      {/* --- CỘT GIỮA --- */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexGrow: 1, // Chiếm hết không gian có thể
          minWidth: 0, // Quan trọng để flex-item có thể thu hẹp
        }}
      >
        <TextField
          id="outlined-search"
          type="text"
          size="small"
          placeholder="Search"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "white" }} />
              </InputAdornment>
            ),
            endAdornment: (
              <CloseIcon
                sx={{
                  color: searchValue ? "white" : "transparent",
                  cursor: "pointer",
                  fontSize: "small",
                }}
                onClick={() => setSearchValue("")}
              />
            ),
          }}
          sx={{
            width: "100%",
            maxWidth: "600px", // Chiều rộng tối đa cho thanh search
            // --- Giữ nguyên styles đã có ---
            "& label": { color: "white" },
            "& input": { color: "white" },
            "& label.Mui-focused": { color: "white" },
            "& .MuiOutlinedInput-root": {
              height: 32,
              paddingRight: 1,
              "& input": {
                padding: "4px 0 4px 0",
              },
              "& fieldset": { borderColor: "white" },
              "&:hover fieldset": { borderColor: "white" },
              "&.Mui-focused fieldset": { borderColor: "white" },
            },
          }}
        />
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
          <Button
            sx={{
              color: (theme) =>
                theme.palette.mode === "dark" ? "rgb(50, 50, 50)" : "white",
              // border: "0.5px solid white",
              border: "none",
              bgcolor: (theme) =>
                theme.palette.mode === "dark" ? "#78a7f5" : "#1976d2",
              "&:hover": {
                border: "none",
                bgcolor: (theme) =>
                  theme.palette.mode === "dark" ? "#8fb8f6" : "#2b80cf",
              },
              marginLeft: 2,
              padding: "4px 5px",
              minHeight: "28px",
              // fontSize: "0.8rem",
            }}
            variant="outlined"
            // startIcon={<LibraryAddIcon />}
            onClick={() => setOpenCreateModal(true)} // <--- BẤM ĐỂ MỞ MODAL
          >
            Create
          </Button>
        </Box>
      </Box>
      {/* --- CỘT PHẢI --- */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <ModeSelect />
        <Notifications />

        <Tooltip title="Help">
          <HelpOutlineIcon
            sx={{ cursor: "pointer", color: "white", fontSize: "large" }}
          />
        </Tooltip>

        <Profiles />
      </Box>

      {/* Modal Tạo Board */}
      <CreateBoardModal
        isOpen={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
      />
    </Box>
  );
}

export default AppBar;
