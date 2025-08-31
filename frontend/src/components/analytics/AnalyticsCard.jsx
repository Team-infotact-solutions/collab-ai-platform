import React from "react";
import PropTypes from "prop-types";

export default function AnalyticsCard({ title, value }) {
  return (
    <div className="p-4 bg-white rounded-xl shadow-md flex justify-between items-center">
      <span className="font-medium">{title}</span>
      <span className="text-xl font-bold">{value ?? "—"}</span>
    </div>
  );
}

AnalyticsCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};
