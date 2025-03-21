import React, { useEffect, useCallback } from "react";
import styles from "./suggestedAnswer.module.css";

const SuggestedAnswer = ({ suggestedAnswer, isTyping, onSuggestionClick }) => {
  // Handle clicking the suggestion
  const handleClick = useCallback(() => {
    onSuggestionClick();
  }, [onSuggestionClick]);

  // Handle pressing Enter to select suggestion
  useEffect(() => {
    const handleEnterKey = (e) => {
      if (e.key === "Enter" && suggestedAnswer && !isTyping) {
        onSuggestionClick();
      }
    };
    window.addEventListener("keydown", handleEnterKey);
    return () => {
      window.removeEventListener("keydown", handleEnterKey);
    };
  }, [suggestedAnswer, isTyping, onSuggestionClick]);

  if (!suggestedAnswer || isTyping) return null;

  return (
    <div className={styles.suggestedContainer}>
      <p className={styles.suggestedText}>Suggested answer:</p>
      <div className={styles.suggestedAnswer} onClick={handleClick}>
        {suggestedAnswer}
      </div>
    </div>
  );
};

export default SuggestedAnswer;
