// CardDetail/CardActionButtons.jsx

import React from "react";
import { Box, Button } from "@mui/material";
import CheckListIcon from "@mui/icons-material/Checklist";
import LabelIcon from "@mui/icons-material/Label";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AttachFileIcon from "@mui/icons-material/AttachFile";

function CardActionButtons({ handlers }) {
  return (
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1, mb: 4 }}>
      <Button
        variant="outlined"
        startIcon={<CheckListIcon />}
        onClick={handlers.openChecklist}
      >
        Checklist
      </Button>
      <Button
        variant="outlined"
        startIcon={<LabelIcon />}
        onClick={handlers.openLabels}
      >
        Labels
      </Button>
      <Button
        variant="outlined"
        startIcon={<CalendarTodayIcon />}
        onClick={handlers.openDate}
      >
        Dates
      </Button>
      <Button
        variant="outlined"
        startIcon={<PersonAddIcon />}
        onClick={handlers.openMembers}
      >
        Member
      </Button>
      <Button
        variant="outlined"
        startIcon={<AttachFileIcon />}
        onClick={handlers.openAttach}
      >
        Attached
      </Button>
    </Box>
  );
}

export default CardActionButtons;
