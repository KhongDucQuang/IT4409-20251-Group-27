// CardDetail/CardChecklists.jsx

import React from "react";
import { Box } from "@mui/material";
import ChecklistBlock from "./ChecklistBlock";

function CardChecklists({
  cardData,
  setCardData,
  requestCardDataUpdate,
  boardId,
}) {
  return (
    <Box sx={{ mt: 4 }}>
      {cardData?.checklists?.length > 0 &&
        cardData.checklists.map((checklist) => (
          <ChecklistBlock
            key={checklist.id}
            checklist={checklist}
            cardData={cardData}
            setCardData={setCardData}
            requestCardDataUpdate={requestCardDataUpdate}
            boardId={boardId}
          />
        ))}
    </Box>
  );
}

export default CardChecklists;
