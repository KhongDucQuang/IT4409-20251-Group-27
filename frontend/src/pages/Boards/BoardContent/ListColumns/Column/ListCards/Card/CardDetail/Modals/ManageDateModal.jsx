// ManageDateModal.jsx
import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

// Placeholder cho DatePicker
const DatePicker = ({ value, onChange, disabled, sx, error, helperText }) => (
  <TextField
    type="date"
    size="small"
    fullWidth
    value={value || ""}
    onChange={(e) => onChange(e.target.value)}
    disabled={disabled}
    InputLabelProps={{ shrink: true }}
    sx={sx}
    error={error}
    helperText={helperText}
  />
);

const MODAL_STYLE = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 320,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 2,
  borderRadius: "8px",
};

const PERIODIC_OPTIONS = ["Never", "Daily", "Weekly", "Monthly"];
const REMINDER_OPTIONS = [
  { label: "None", value: "None" },
  { label: "10 minutes before", value: "10min" },
  { label: "1 hour before", value: "1h" },
  { label: "1 day before", value: "1day" },
];

// Component con cho Start / Expiry date
function DateInputRow({ label, dateObj, onChange, error, helperText }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
      <Checkbox
        checked={dateObj.enabled}
        onChange={(e) => onChange({ ...dateObj, enabled: e.target.checked })}
        size="small"
        sx={{ p: 0 }}
      />
      <DatePicker
        value={dateObj.value}
        onChange={(v) => onChange({ ...dateObj, value: v })}
        disabled={!dateObj.enabled}
        sx={{ flexGrow: 1 }}
        error={error}
        helperText={helperText}
      />
      {"time" in dateObj && (
        <TextField
          size="small"
          value={dateObj.time}
          onChange={(e) => onChange({ ...dateObj, time: e.target.value })}
          sx={{ width: 100 }}
          disabled={!dateObj.enabled}
        />
      )}
    </Box>
  );
}

export default function ManageDateModal({ open, onClose, cardId, card }) {
  const currentCard = card || {};

  const initialState = {
    start: {
      value: currentCard.startDate || "",
      enabled: !!currentCard.startDate,
    },
    expiry: {
      value: currentCard.expiryDate || "",
      enabled: !!currentCard.expiryDate,
      time: "15:58",
    },
    periodicity: "Never",
    reminder: "None",
  };

  const [dates, setDates] = useState(initialState);
  const [errorExpiry, setErrorExpiry] = useState(false);

  // Reset khi modal mở hoặc card thay đổi
  useEffect(() => {
    if (open) setDates(initialState);
  }, [open, card]);

  // Kiểm tra lỗi: expiry < start
  useEffect(() => {
    if (dates.start.enabled && dates.expiry.enabled) {
      const start = new Date(dates.start.value);
      const expiry = new Date(dates.expiry.value);
      setErrorExpiry(expiry < start);
    } else {
      setErrorExpiry(false);
    }
  }, [dates.start.value, dates.expiry.value]);

  const handleSave = () => {
    console.log(
      `Card ${cardId} Save: Start=${
        dates.start.enabled ? dates.start.value : "N/A"
      }, Expiry=${dates.expiry.enabled ? dates.expiry.value : "N/A"} ${
        dates.expiry.time
      }, Periodicity=${dates.periodicity}, Reminder=${dates.reminder}`
    );
    onClose();
  };

  const handleRemove = () => {
    console.log(`Card ${cardId} Remove dates`);
    onClose();
  };

  const isSaveDisabled =
    (!dates.start.enabled && !dates.expiry.enabled) || errorExpiry;
  const isRemoveDisabled = !currentCard.startDate && !currentCard.expiryDate;

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={MODAL_STYLE}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #333",
            mb: 1,
            pb: 1,
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Dates
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Start Date */}
        <Typography variant="body2" fontWeight="bold" mb={1}>
          Start date
        </Typography>
        <DateInputRow
          label="Start"
          dateObj={dates.start}
          onChange={(val) => setDates((prev) => ({ ...prev, start: val }))}
        />

        {/* Due date */}
        <Typography variant="body2" fontWeight="bold" mb={1}>
          Due date
        </Typography>
        <DateInputRow
          label="Expiry"
          dateObj={dates.expiry}
          onChange={(val) => setDates((prev) => ({ ...prev, expiry: val }))}
          error={errorExpiry}
          helperText={errorExpiry ? "Due date cannot be before Start date" : ""}
        />

        {/* Reminders */}
        <Typography variant="body2" fontWeight="bold" mb={1}>
          Set due date reminder
        </Typography>
        <FormControl fullWidth size="small" sx={{ mb: 1 }}>
          <Select
            value={dates.reminder}
            onChange={(e) =>
              setDates((prev) => ({ ...prev, reminder: e.target.value }))
            }
          >
            {REMINDER_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography
          variant="caption"
          color="textSecondary"
          display="block"
          mb={2}
        >
          Reminders will be sent to all members and watchers of this card.
        </Typography>

        {/* Buttons */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 2 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleSave}
            disabled={isSaveDisabled}
          >
            Save
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleRemove}
            disabled={isRemoveDisabled}
            sx={{ color: "error.main", borderColor: "error.main" }}
          >
            Remove
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
