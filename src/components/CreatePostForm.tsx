import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { MarkdownContent } from "./MarkdownContent";

export function CreatePostForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const createPost = useMutation(api.posts.createPost);
  const generateUploadUrl = useMutation(api.posts.generateUploadUrl);
  const getImageUrl = useMutation(api.posts.getImageUrl);

  // Helper function to validate image files
  const isValidImageFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPEG, PNG, GIF, or WebP)");
      return false;
    }
    
    if (file.size > maxSize) {
      toast.error("Image file must be less than 10MB");
      return false;
    }
    
    return true;
  };

  // Helper function to upload image and get markdown
  const uploadImageAndGetMarkdown = async (file: File): Promise<string> => {
    if (!isValidImageFile(file)) {
      throw new Error("Invalid image file");
    }

    setIsUploading(true);
    try {
      // Generate upload URL
      const uploadUrl = await generateUploadUrl();
      
      // Upload the file
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const { storageId } = await response.json();
      
      // Get the public URL
      const imageUrl = await getImageUrl({ storageId });
      
      // Generate alt text from filename
      const altText = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      
      return `![${altText}](${imageUrl})`;
    } finally {
      setIsUploading(false);
    }
  };

  // Helper function to insert text at cursor position
  const insertTextAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const before = content.substring(0, startPos);
    const after = content.substring(endPos);
    
    const newContent = before + text + after;
    setContent(newContent);
    
    // Set cursor position after inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(startPos + text.length, startPos + text.length);
    }, 0);
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only hide drag overlay if leaving the textarea entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      toast.error("Please drop image files only");
      return;
    }

    for (const file of imageFiles) {
      try {
        const markdown = await uploadImageAndGetMarkdown(file);
        insertTextAtCursor(`\n${markdown}\n`);
        toast.success(`Image "${file.name}" uploaded successfully`);
      } catch (error) {
        toast.error(`Failed to upload image "${file.name}"`);
        console.error("Upload error:", error);
      }
    }
  };

  // Handle paste
  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const imageItems = items.filter(item => item.type.startsWith('image/'));

    if (imageItems.length === 0) return;

    e.preventDefault();

    for (const item of imageItems) {
      const file = item.getAsFile();
      if (file) {
        try {
          const markdown = await uploadImageAndGetMarkdown(file);
          insertTextAtCursor(`\n${markdown}\n`);
          toast.success("Image pasted and uploaded successfully");
        } catch (error) {
          toast.error("Failed to upload pasted image");
          console.error("Paste upload error:", error);
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const tagArray = tags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      await createPost({
        title: title.trim(),
        content: content.trim(),
        tags: tagArray,
      });

      setTitle("");
      setContent("");
      setTags("");
      toast.success("Post created successfully!");
    } catch (error) {
      toast.error("Failed to create post");
      console.error("Failed to create post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Create New Post</h2>
        <p className="text-gray-600 dark:text-gray-400">Share your knowledge with the community</p>
      </div>
      
      {/* Responsive layout: side-by-side on lg+, stacked on smaller screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Card */}
        <div className="bg-white dark:bg-card-dark rounded-lg shadow-sm border border-gray-200 dark:border-card-border-dark p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Edit Post</h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter an engaging post title..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-colors text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                required
              />
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="react, javascript, tutorial, web-development..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Separate tags with commas. Use lowercase and hyphens for multi-word tags.
              </p>
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content *
              </label>
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  id="content"
                  rows={20}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onPaste={handlePaste}
                  placeholder="Write your post content here...

You can use plain text or basic markdown formatting:

# Heading 1
## Heading 2
### Heading 3

**Bold text**
*Italic text*

- List item 1
- List item 2

```
Code block
```

[Link text](https://example.com)

📝 TIP: You can drag & drop or paste images directly into this editor!"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 outline-none resize-none font-mono text-sm leading-relaxed bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors ${
                    isDragOver 
                      ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20" 
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  required
                />
                {isDragOver && (
                  <div className="absolute inset-0 border-2 border-dashed border-blue-500 dark:border-blue-400 bg-blue-50/80 dark:bg-blue-900/40 rounded-lg flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <div className="text-blue-600 dark:text-blue-400 text-lg font-semibold mb-2">
                        📷 Drop images here
                      </div>
                      <div className="text-blue-500 dark:text-blue-300 text-sm">
                        Images will be uploaded and inserted as markdown
                      </div>
                    </div>
                  </div>
                )}
                {isUploading && (
                  <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-md shadow-lg flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">Uploading image...</span>
                  </div>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Write in plain text or use basic markdown formatting. You can drag & drop or paste images directly into the editor.
              </p>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => {
                  setTitle("");
                  setContent("");
                  setTags("");
                }}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium bg-white dark:bg-gray-800"
              >
                Clear Form
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !title.trim() || !content.trim()}
                className="px-8 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm hover:shadow-md"
              >
                {isSubmitting ? (
                  <span className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </span>
                ) : (
                  "Publish Post"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Preview Card */}
        <div className="bg-white dark:bg-card-dark rounded-lg shadow-sm border border-gray-200 dark:border-card-border-dark p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Live Preview</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Live</span>
            </div>
          </div>
          
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
            {/* Preview Header */}
            {title.trim() && (
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {title}
                </h1>
                {tags.trim() && (
                  <div className="flex flex-wrap gap-2">
                    {tags.split(",").map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full font-medium"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Preview Content */}
            <div className="h-[900px] overflow-y-auto">
              {content.trim() ? (
                <div className="p-6">
                  <MarkdownContent content={content} />
                </div>
              ) : (
                <div className="p-6 h-full flex items-center justify-center text-center">
                  <div className="text-gray-400 dark:text-gray-500">
                    <div className="text-4xl mb-4">📝</div>
                    <p className="text-lg font-medium mb-2">Start writing to see preview</p>
                    <p className="text-sm">Your markdown content will appear here as you type</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
