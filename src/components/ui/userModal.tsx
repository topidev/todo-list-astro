import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@radix-ui/react-dialog";
import { Button } from "./button";
import { Share2 } from "lucide-react";
import { useEffect } from "react";



export default function UserModal({
    open, onOpenChange
}: {
    open: boolean,
    onOpenChange: (open: boolean) => void
}) {

    useEffect(() => {
        if (open) { document.body.style.overflow = 'hidden' }
        else { document.body.style.overflow = 'unset' }

        return () => { document.body.style.overflow = 'unset' }
    }, [open])
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="user-dialog flex flex-col items-center justify-center text-center top-0 z-10 left-0 absolute p-2 w-full h-full">
                <form className="w-5/6 sm:max-w-[425px] bg-slate-700 p-5 rounded">
                    <DialogTitle className="text-lg flex justify-between text-left sm:text-xl mb-6 font-bold text-white">
                        Compartir
                        <Share2></Share2>
                    </DialogTitle>
                    <div className="flex flex-col justify-start items-center w-full gap-2">
                        <div className="flex justify-start w-full items-start gap-2">
                            <label className="text-white hidden text-sm sm:text-lg" htmlFor="name">Correo: </label>
                            <input
                                name=""
                                id="name"
                                type="email"
                                placeholder="someone@example.com"
                                className=" w-full h-[36px] p-2 rounded border-1 text-white bg-slate-900">

                            </input>
                        </div>
                    </div>
                    <footer className="flex mt-3 justify-between">
                        <DialogClose asChild>
                            <Button variant={"outline"}> Cancel </Button>
                        </DialogClose>
                        <Button type="submit">Compartir</Button>
                    </footer>
                </form>
            </DialogContent>
        </Dialog>
    )
}