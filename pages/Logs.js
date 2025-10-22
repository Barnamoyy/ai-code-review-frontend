"use client";
import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import Loader from "@/components/Loader";
import { X } from "lucide-react";

const Logs = ({ title, className }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const logsEndRef = useRef(null);

  useEffect(() => {
    const socket = io("http://localhost:8080");

    socket.on("connect", () => {
      setIsConnected(true);
      setLoading(false);
    });

    socket.on("log", (logData) => {
      setLogs((prev) => [...prev, logData]);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const getLogColor = (type) => {
    const colors = {
      error: "#dc2626",
      warn: "#d97706",
      info: "#2563eb",
      success: "#16a34a",
    };
    return colors[type] || "#15803d";
  };

  if (loading) return <Loader />;

  return (
    <div className="flex flex-1 flex-col">
      <div className={`flex flex-col gap-4 ${className}`}>
        {/* Header */}
        <div className="flex justify-between items-center px-6 pt-4">
          {title && <h1 className="text-black font-semibold text-lg">{title}</h1>}
          <div className="w-full flex items-center justify-between gap-3">
            <span className="text-black font-semibold text-base md:text-lg">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
            <button
              onClick={() => setLogs([])}
              className="text-black font-semibold text-base md:text-lg flex flex-row gap-1 items-center"
            >
              Clear
              <X className="w-5 h-5"/>
            </button>
          </div>
        </div>

        {/* Terminal */}
        <div className="mx-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="h-[700px] overflow-y-auto p-4 font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-gray-500 text-start p-4">
                Waiting for logs...
              </div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-2 text-gray-800">
                  <span className="text-gray-500 mr-2">
                    [{new Date(log.timestamp).toLocaleTimeString()}]
                  </span>
                  <span
                    className="font-bold uppercase mr-2"
                    style={{ color: getLogColor(log.type) }}
                  >
                    [{log.type}]
                  </span>
                  {log.source && (
                    <span className="text-indigo-600 mr-2">[{log.source}]</span>
                  )}
                  <span>{log.message}</span>
                  {(log.repo || log.prNumber || log.action) && (
                    <div className="ml-24 text-xs text-gray-500 mt-1">
                      {log.repo && `repo: ${log.repo} `}
                      {log.prNumber && `PR: #${log.prNumber} `}
                      {log.action && `action: ${log.action} `}
                      {log.commitId && `commit: ${log.commitId.slice(0, 7)}`}
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logs;
