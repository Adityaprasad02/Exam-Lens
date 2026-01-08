// src/AnalysisPDF.jsx
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 11,
    padding: 24,
    backgroundColor: "#ffffff",
    color: "#111827",
  },
  title: { 
    fontSize: 24, 
    fontWeight: 700, 
    marginBottom: 8, 
    textAlign: "center",
    color: "#1e40af",
  },
  subtitle: {
    fontSize: 12,
    textAlign: "center",
    color: "#6B7280",
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 12,
    marginTop: 20,
    color: "#1e40af",
    borderBottomWidth: 2,
    borderBottomColor: "#3b82f6",
    paddingBottom: 4,
  },

  fileCard: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
  },

  fileTitle: { 
    fontSize: 14, 
    fontWeight: 700, 
    marginBottom: 6,
    color: "#111827",
  },
  fileInfo: {
    fontSize: 9,
    color: "#6B7280",
    marginBottom: 8,
  },
  topicTitle: { 
    fontSize: 12, 
    fontWeight: 700, 
    marginTop: 6,
    color: "#374151",
  },
  subtopicTitle: { 
    fontSize: 10, 
    color: "#6B7280", 
    marginTop: 4,
    fontWeight: 600,
  },
  subtopic: { 
    fontSize: 9, 
    marginLeft: 12,
    marginTop: 2,
    color: "#4B5563",
  },

  divider: {
    marginVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  chartSection: {
    marginTop: 20,
    marginBottom: 20,
  },

  chart: {
    width: "100%",
    height: 280,
    marginTop: 12,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  chartCaption: {
    fontSize: 9,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 4,
    fontStyle: "italic",
  },

  tableContainer: {
    marginTop: 12,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#3b82f6",
    padding: 8,
    borderRadius: 4,
    marginBottom: 4,
  },

  tableHeaderText: {
    fontSize: 10,
    fontWeight: 700,
    color: "#ffffff",
    flex: 1,
  },

  tableRow: {
    flexDirection: "row",
    padding: 6,
    backgroundColor: "#F9FAFB",
    marginBottom: 2,
    borderRadius: 3,
  },

  tableRowAlt: {
    flexDirection: "row",
    padding: 6,
    backgroundColor: "#ffffff",
    marginBottom: 2,
    borderRadius: 3,
  },

  tableCell: {
    fontSize: 9,
    color: "#374151",
    flex: 1,
  },

  footer: {
    position: "absolute",
    bottom: 20,
    left: 24,
    right: 24,
    textAlign: "center",
    fontSize: 8,
    color: "#9CA3AF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 8,
  },

  badge: {
    fontSize: 9,
    color: "#059669",
    backgroundColor: "#D1FAE5",
    padding: "3 6",
    borderRadius: 3,
    marginLeft: 6,
  },
});

export default function AnalysisPDF({
  analyzedFiles = [],
  comparisonData = [],
  chartImageBase64 = null,
}) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Exam-lens Analysis Report</Text>
        <Text style={styles.subtitle}>Generated on {currentDate}</Text>

        {/* Chart Section - Moved to top for visibility */}
        {chartImageBase64 && (
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>Comparison Chart</Text>
            <Image 
              src={chartImageBase64} 
              style={styles.chart}
              cache={false}
            />
            <Text style={styles.chartCaption}>
              Topic-wise distribution across all analyzed papers (in percentage)
            </Text>
          </View>
        )}

        {/* Comparison Table */}
        {comparisonData.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <Text style={styles.sectionTitle}>Comparison Table</Text>
            
            <View style={styles.tableContainer}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Topic</Text>
                {analyzedFiles.map((file, idx) => (
                  <Text key={idx} style={styles.tableHeaderText}>
                    {file.file_name.length > 12 
                      ? file.file_name.substring(0, 12) + '...' 
                      : file.file_name}
                  </Text>
                ))}
              </View>

              {/* Table Rows */}
              {comparisonData.map((row, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <View key={idx} style={isEven ? styles.tableRow : styles.tableRowAlt}>
                    <Text style={[styles.tableCell, { flex: 1.5, fontWeight: 600 }]}>
                      {row.name}
                    </Text>
                    {Object.entries(row)
                      .filter(([k]) => k !== "name")
                      .map(([fileName, value], i) => (
                        <Text key={i} style={styles.tableCell}>
                          {value}%
                        </Text>
                      ))}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Detailed File Analysis */}
        <Text style={styles.sectionTitle}>Detailed Analysis</Text>

        {analyzedFiles.map((file, fileIdx) => {
          const totalMarks = (file.analysis || []).reduce(
            (s, t) => s + (Number(t.Total_Marks) || 0),
            0
          );

          return (
            <View key={file.file_name} style={styles.fileCard} break={fileIdx > 0}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.fileTitle}>{file.file_name}</Text>
                {!file.error && (
                  <Text style={styles.badge}>✓ Success</Text>
                )}
              </View>
              
              <Text style={styles.fileInfo}>
                Total Marks: {totalMarks} | Size: {file.size_kb ?? "N/A"} KB
              </Text>

              {file.error ? (
                <Text style={{ fontSize: 10, color: "#DC2626", marginTop: 4 }}>
                  ⚠ Analysis failed for this file
                </Text>
              ) : (
                (file.analysis || []).map((topic, idx) => {
                  const percent =
                    totalMarks > 0
                      ? ((topic.Total_Marks / totalMarks) * 100).toFixed(1)
                      : "0.0";

                  return (
                    <View key={idx}>
                      <Text style={styles.topicTitle}>
                        {topic.Topic} — {topic.Total_Marks} Marks ({percent}%)
                      </Text>

                      {(topic.Important_Subtopics || []).length > 0 && (
                        <>
                          <Text style={styles.subtopicTitle}>Important Subtopics:</Text>
                          {topic.Important_Subtopics.map((sub, i) => (
                            <Text key={i} style={styles.subtopic}>
                              • {sub}
                            </Text>
                          ))}
                        </>
                      )}

                      {idx < (file.analysis || []).length - 1 && (
                        <View style={styles.divider} />
                      )}
                    </View>
                  );
                })
              )}
            </View>
          );
        })}

        <Text style={styles.footer}>
          Generated by Exam-lens | Comprehensive Exam Analysis Tool
        </Text>
      </Page>
    </Document>
  );
}