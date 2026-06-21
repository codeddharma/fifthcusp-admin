import { useEffect } from 'react'
import { EditorContent, useEditor, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Code2,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  Minus,
  Pilcrow,
  Eraser,
} from 'lucide-react'
import clsx from 'clsx'

interface Props {
  value: string
  onChange: (next: string) => void
  placeholder?: string
  minHeight?: string
}

export function RichTextEditor({ value, onChange, placeholder, minHeight = '24rem' }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        codeBlock: { HTMLAttributes: { class: 'tiptap-code-block' } },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      Image.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder: placeholder ?? 'Write the article…' }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'tiptap-editor prose-blog focus:outline-none',
      },
    },
  })

  // Keep editor in sync when external value resets (e.g. loading existing blog)
  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (value && value !== current) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [value, editor])

  if (!editor) return null

  return (
    <div className="overflow-hidden rounded-md border border-shell-border bg-white">
      <Toolbar editor={editor} />
      <div className="overflow-y-auto p-3 scroll-thin" style={{ minHeight, maxHeight: '70vh' }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

function Toolbar({ editor }: { editor: Editor }) {
  function promptLink() {
    const previous = editor.getAttributes('link').href as string | undefined
    const next = window.prompt('URL (leave empty to remove)', previous ?? 'https://')
    if (next === null) return
    if (next === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: next }).run()
  }

  function promptImage() {
    const url = window.prompt('Image URL')
    if (!url) return
    editor.chain().focus().setImage({ src: url }).run()
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-shell-border bg-shell-bg p-1">
      <Btn label="Paragraph" onClick={() => editor.chain().focus().setParagraph().run()}>
        <Pilcrow size={14} />
      </Btn>
      <Btn
        label="H2"
        active={editor.isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 size={14} />
      </Btn>
      <Btn
        label="H3"
        active={editor.isActive('heading', { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 size={14} />
      </Btn>

      <Sep />

      <Btn
        label="Bold"
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold size={14} />
      </Btn>
      <Btn
        label="Italic"
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic size={14} />
      </Btn>
      <Btn
        label="Underline"
        active={editor.isActive('underline')}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon size={14} />
      </Btn>
      <Btn
        label="Strike"
        active={editor.isActive('strike')}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough size={14} />
      </Btn>

      <Sep />

      <Btn
        label="Bullet list"
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List size={14} />
      </Btn>
      <Btn
        label="Numbered list"
        active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered size={14} />
      </Btn>
      <Btn
        label="Quote"
        active={editor.isActive('blockquote')}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote size={14} />
      </Btn>
      <Btn
        label="Inline code"
        active={editor.isActive('code')}
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        <Code size={14} />
      </Btn>
      <Btn
        label="Code block"
        active={editor.isActive('codeBlock')}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <Code2 size={14} />
      </Btn>
      <Btn label="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus size={14} />
      </Btn>

      <Sep />

      <Btn label="Link" active={editor.isActive('link')} onClick={promptLink}>
        <LinkIcon size={14} />
      </Btn>
      <Btn label="Image" onClick={promptImage}>
        <ImageIcon size={14} />
      </Btn>

      <Sep />

      <Btn label="Clear formatting" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
        <Eraser size={14} />
      </Btn>

      <div className="ml-auto flex items-center gap-0.5">
        <Btn label="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <Undo size={14} />
        </Btn>
        <Btn label="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <Redo size={14} />
        </Btn>
      </div>
    </div>
  )
}

interface BtnProps {
  label: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}

function Btn({ label, active, disabled, onClick, children }: BtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={clsx(
        'focus-ring inline-flex h-7 items-center justify-center rounded px-2 text-shell-text transition-colors',
        active ? 'bg-brand-purple/20 text-brand-deep' : 'hover:bg-white',
        disabled && 'cursor-not-allowed opacity-40 hover:bg-transparent',
      )}
    >
      {children}
    </button>
  )
}

function Sep() {
  return <span className="mx-1 h-5 w-px bg-shell-border" />
}
