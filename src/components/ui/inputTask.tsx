
interface InputProps {
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void 
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
    disabled?: boolean
    placeholder?: string
}

export default function IdeaInput({
    value, onChange, onKeyDown, disabled, placeholder
}: InputProps) {
    return (
        <input
            type="text"
            id="ideasInput"
            name="ideasInput"
            value={value}
            onKeyDown={onKeyDown}
            placeholder="Escribe una idea y presiona Enter..."
            className="w-full text-gray-600 px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-colors"
            onChange={onChange}
            disabled={disabled}
        />
    )
}