import React, { useState } from "react";
import { toast } from "react-toastify";
import { sendEmail } from "../api/sendEmail";
import {
  Editor as DraftEditor,
  EditorState,
  RichUtils
} from "draft-js";
import "draft-js/dist/Draft.css";
import { MdFormatBold, MdFormatItalic, MdFormatUnderlined, MdStrikethroughS, MdCode, MdFormatQuote, MdFormatListBulleted, MdFormatListNumbered, MdLooksOne, MdLooksTwo, MdUndo, MdRedo } from "react-icons/md";
import { useForm, Controller } from "react-hook-form";

// Unified ToolbarButton for both inline and block styles
const ToolbarButton = ({ style, label, onToggle, active }: { style: string; label: React.ReactNode; onToggle: (style: string) => void; active: boolean }) => (
  <button
    type="button"
    onMouseDown={e => {
      e.preventDefault();
      onToggle(style);
    }}
    style={{ fontWeight: active ? "bold" : "normal", marginRight: 8 }}
    aria-label={typeof label === 'string' ? label : undefined}
  >
    {label}
  </button>
);

const INLINE_STYLES = [
  { label: <MdFormatBold size={18} aria-label="Bold" />, style: "BOLD" },
  { label: <MdFormatItalic size={18} aria-label="Italic" />, style: "ITALIC" },
  { label: <MdFormatUnderlined size={18} aria-label="Underline" />, style: "UNDERLINE" },
  { label: <MdStrikethroughS size={18} aria-label="Strikethrough" />, style: "STRIKETHROUGH" },
  { label: <MdCode size={18} aria-label="Code" />, style: "CODE" }
];

const BLOCK_TYPES = [
  { label: <MdLooksOne size={18} aria-label="Header 1" />, style: "header-one" },
  { label: <MdLooksTwo size={18} aria-label="Header 2" />, style: "header-two" },
  { label: <MdFormatQuote size={18} aria-label="Blockquote" />, style: "blockquote" },
  { label: <MdFormatListBulleted size={18} aria-label="Unordered List" />, style: "unordered-list-item" },
  { label: <MdFormatListNumbered size={18} aria-label="Ordered List" />, style: "ordered-list-item" }
];

const NotificationCard: React.FC = () => {
  type FormData = {
    to: string;
    subject: string;
    body: EditorState;
  };
  const { handleSubmit, control, reset, formState: { isSubmitting } } = useForm<FormData>({
    defaultValues: {
      to: "",
      subject: "",
      body: EditorState.createEmpty(),
    },
  });
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const [isLoading, setIsLoading] = useState(false);

  const handleKeyCommand = (command: string, state: EditorState) => {
    const newState = RichUtils.handleKeyCommand(state, command);
    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  };

  const onInlineClick = (style: string) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, style));
  };

  const onBlockClick = (blockType: string) => {
    setEditorState(RichUtils.toggleBlockType(editorState, blockType));
  };

  const onUndo = () => {
    setEditorState(EditorState.undo(editorState));
  };
  const onRedo = () => {
    setEditorState(EditorState.redo(editorState));
  };

  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();

  // Convert editor content to HTML (simple, for demo)
  const editorStateToHtml = (state: EditorState) => {
    const content = state.getCurrentContent();
    const blocks = content.getBlocksAsArray();
    return blocks
      .map(block => {
        const text = block.getText();
        let result = text;
        const inlineStyles = state.getCurrentInlineStyle();
        if (inlineStyles.has("BOLD")) result = `<strong>${result}</strong>`;
        if (inlineStyles.has("ITALIC")) result = `<em>${result}</em>`;
        if (inlineStyles.has("UNDERLINE")) result = `<u>${result}</u>`;
        if (inlineStyles.has("STRIKETHROUGH")) result = `<s>${result}</s>`;
        if (inlineStyles.has("CODE")) result = `<code>${result}</code>`;
        let tag = "p";
        switch (block.getType()) {
          case "header-one": tag = "h1"; break;
          case "header-two": tag = "h2"; break;
          case "blockquote": tag = "blockquote"; break;
          case "unordered-list-item": tag = "li"; result = `<ul>${result}</ul>`; break;
          case "ordered-list-item": tag = "li"; result = `<ol>${result}</ol>`; break;
        }
        return `<${tag}>${result}</${tag}>`;
      })
      .join("");
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await sendEmail({
        to: data.to,
        subject: data.subject,
        body: editorStateToHtml(data.body),
      });
      toast.success("Email sent successfully!");
      reset();
      setEditorState(EditorState.createEmpty());
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send email.");
    } finally {
      setIsLoading(false);
    }
  };

  const currentStyle = editorState.getCurrentInlineStyle();

  return (
    <div className="max-w-md mx-auto bg-white border border-gray-200 rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-blue-600 mb-6">Send Notification Email</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="to" className="block text-left text-gray-700 font-medium mb-1">To</label>
          <Controller
            name="to"
            control={control}
            rules={{ required: "Recipient email is required" }}
            render={({ field }) => (
              <input
                type="email"
                id="to"
                {...field}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                placeholder="recipient@domain.com"
              />
            )}
          />
        </div>
        <div>
          <label htmlFor="subject" className="block text-left text-gray-700 font-medium mb-1">Subject</label>
          <Controller
            name="subject"
            control={control}
            rules={{ required: "Subject is required" }}
            render={({ field }) => (
              <input
                type="text"
                id="subject"
                {...field}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                placeholder="Subject"
              />
            )}
          />
        </div>
        <div>
          <label htmlFor="body" className="block text-left text-gray-700 font-medium mb-1">Message</label>
          <Controller
            name="body"
            control={control}
            defaultValue={EditorState.createEmpty()}
            render={({ field: { onChange, value } }) => (
              <div className="border rounded-lg p-2 bg-white">
                <div style={{ marginBottom: 8 }}>
                  {INLINE_STYLES.map(type => (
                    <ToolbarButton
                      key={type.style}
                      style={type.style}
                      label={type.label}
                      onToggle={onInlineClick}
                      active={currentStyle.has(type.style)}
                    />
                  ))}
                  {BLOCK_TYPES.map(type => (
                    <ToolbarButton
                      key={type.style}
                      style={type.style}
                      label={type.label}
                      onToggle={onBlockClick}
                      active={blockType === type.style}
                    />
                  ))}
                  <button
                    type="button"
                    onMouseDown={e => {
                      e.preventDefault();
                      onUndo();
                    }}
                    style={{ marginRight: 8 }}
                    aria-label="Undo"
                  ><MdUndo size={18} /></button>
                  <button
                    type="button"
                    onMouseDown={e => {
                      e.preventDefault();
                      onRedo();
                    }}
                    aria-label="Redo"
                  ><MdRedo size={18} /></button>
                </div>
                <div className="min-h-[100px] px-2 py-1 outline-none cursor-text" style={{ background: "#fff" }}>
                  <DraftEditor
                    editorState={value}
                    onChange={es => {
                      setEditorState(es);
                      onChange(es);
                    }}
                    handleKeyCommand={handleKeyCommand}
                    placeholder="Type your message here..."
                    spellCheck={true}
                  />
                </div>
              </div>
            )}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || isSubmitting}
          aria-label="Send notification email"
          className={`w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold shadow hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8h8a8 8 0 11-16 0z"
                />
              </svg>
              Sending...
            </span>
          ) : (
            "Send Email"
          )}
        </button>
      </form>
    </div>
  );
};

export default NotificationCard;
