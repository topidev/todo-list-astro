import { useState, type ReactEventHandler } from "react"
import { useAuth } from "../auth/AuthProvider"
import type { Idea } from "../../types/types"



export default function Board() {
    // - Valor del input
    const [inputValue, setInputValue] = useState('')
    // - Lista de Idea (Despues buscar en base de datos)
    const [ideasList, setIdeasList] = useState<Idea[]>([])
    // - Revisar el inicio de sesión
    const { user } = useAuth()


    // - Método para el enter en el input
    const handleEnter = (e : React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault() 
            console.log("Nueva Idea: " + inputValue)

            const newIdea: Idea = {
                id: crypto.randomUUID(), // Genera un ID único
                text: inputValue,
                status: 'new' 
            };

            setIdeasList([...ideasList, newIdea])
            setInputValue('')
        }
    }

    return (
        <div className={`board-container p-2 w-full h-full flex flex-col ${user ? '': 'disable'}`}>
            <div className="input-form w-full">
                <h3 className="mb-2 text-xs md:text-lg lg:text-xl">
                    ¿Qué se te ocurre hoy?
                </h3>
                <input 
                    type="text" 
                    id="ideasInput"
                    name="ideasInput"
                    value={inputValue}
                    onKeyDown={handleEnter} 
                    className="activity mb-4 mt-2 w-full rounded " 
                    onChange={e => setInputValue(e.target.value)} 
                />
            </div>
            <main className="container-list w-full flex gap-2 flex-col md:flex-row">
                <div className="state flex flex-col new">
                    <h2 className="mb-2 text-xs md:text-lg lg:text-xl">Ideas</h2>
                    <div className="list flex flex-col gap-2">
                        {ideasList.map((idea, index) => (
                            <div key={index} className="idea p-2 bg-white shadow rounded border">
                                {idea.text}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="state flex flex-col inProgress">
                    <h2 className="mb-2 text-xs md:text-lg lg:text-xl">En Proceso</h2>
                </div>
                <div className="state flex flex-col onPaused">
                    <h2 className="mb-2 text-xs md:text-lg lg:text-xl">Pausada</h2>
                </div>
                <div className="state flex flex-col Finished">
                    <h2 className="mb-2 text-xs md:text-lg lg:text-xl">Terminadas</h2>
                </div>
            </main>
            <div className="state dropped flex flex-col">
                <h2 className="mb-2 text-xs md:text-lg lg:text-xl">Abandonada</h2>
            </div>
        </div>
    )
}

