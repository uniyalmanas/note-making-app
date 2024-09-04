import moment from "moment";
import React from "react";
import { MdOutlinePushPin, MdCreate, MdDelete } from "react-icons/md";

const NoteCard = ({
  title,
  date,
  content,
  tags,
  isPinned,
  onEdit,
  onDelete,
  onPinNote,
}) => {
  // Use today's date if the given date is invalid or null
  const formattedDate = moment(date).isValid()
    ? moment(date).format("Do MMM YYYY")
    : moment().format("Do MMM YYYY");

  return (
    <div className="border rounded p-4 bg-white hover:shadow-xl transition-all ease-in-out">
      <div className="flex items-center justify-between">
        <div>
          <h6 className="text-sm font-medium">{title}</h6>
          <span className="text-xs text-slate-500">{formattedDate}</span>
        </div>

        {/* Pin note */}
        <MdOutlinePushPin className={isPinned ? 'text-yellow-500' : ''} onClick={onPinNote} />
      </div>

      {/* Truncated content */}
      <p className="text-xs text-slate-500 mt-2">{content?.slice(0, 60)}</p>

      <div className="flex items-center gap-2">
        {/* Map over tags if `tags` is an array */}
        {Array.isArray(tags) && (
          <div className="text-xs text-slate-500"> 
            {tags.map((item, index) => (
              <span key={index}>#{item} </span>
            ))}
          </div>
        )}

        {/* Edit and delete icons */}
        <div className="flex items-center gap-2 ml-auto">
          <MdCreate
            className="icon-btn hover:text-green-600 "
            onClick={onEdit}
          />
          <MdDelete
            className="icon-btn hover:text-red-600 "
            onClick={onDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
