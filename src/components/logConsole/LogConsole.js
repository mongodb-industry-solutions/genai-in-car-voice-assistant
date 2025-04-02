import React, { useState, useEffect, useRef } from "react";
import { useChatSession } from "@/context/ChatSessionContext";
import Icon from "@leafygreen-ui/icon";
import IconButton from "@leafygreen-ui/icon-button";
import Tooltip from "@leafygreen-ui/tooltip";
import styles from "./logConsole.module.css";
import Badge from "@leafygreen-ui/badge";
import Code from "@leafygreen-ui/code";
import { Body } from "@leafygreen-ui/typography";

const LogConsole = ({ simulationMode }) => {
  const [logs, setLogs] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const logContainerRef = useRef(null);

  const sessionId = useChatSession();

  useEffect(() => {
    if (!sessionId || simulationMode) return;

    const fetchLogs = async () => {
      const response = await fetch("/api/action/findOne", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collection: "logs",
          filter: { sessionId },
          projection: { logs: 1, _id: 0 },
        }),
      });

      const data = await response.json();
      setLogs(data?.logs || []);
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, [sessionId, simulationMode]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTo(0, logContainerRef.current.scrollHeight);
    }
  }, []);

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <>
      {!isExpanded ? (
        <Tooltip
          trigger={
            <IconButton
              className={styles.floatingButton}
              onClick={() => setIsExpanded(true)}
              active={true}
              aria-label="Open Log Console"
            >
              <Icon glyph="Code" />
            </IconButton>
          }
        >
          Open the agent tools console log
        </Tooltip>
      ) : (
        <div className={styles.console}>
          <div className={styles.header}>
            <Body weight="medium">Log Console</Body>
            <IconButton
              className={styles.closeButton}
              onClick={() => setIsExpanded(false)}
              aria-label="Close Log Console"
            >
              <Icon glyph="X" />
            </IconButton>
          </div>

          <div ref={logContainerRef} className={styles.logsContainer}>
            {logs.slice(-20).map((log, index) => (
              <div key={index} className={styles.logEntry}>
                <div
                  className={styles.logHeader}
                  onClick={() => toggleExpand(index)}
                >
                  <span className={styles.timestamp}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className={styles.toolName}>{log.toolName}</span>
                  <Badge
                    className={styles.badge}
                    variant={log.type === "call" ? "blue" : "green"}
                  >
                    {log.type.toUpperCase()}
                  </Badge>
                  <Icon
                    glyph={
                      expandedIndex === index ? "ChevronUp" : "ChevronDown"
                    }
                  />
                </div>

                {expandedIndex === index && (
                  <Code language="json" className={styles.logDetails}>
                    {JSON.stringify(log.details, null, 2)}
                  </Code>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default LogConsole;
