import { Trash2 } from "lucide-react";
import type { UserData } from "../../types/types";
import { Button } from "./button";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

interface MemberItemProps {
    member: UserData
    isOwner: boolean
    canRemove: boolean
    onRemove: (userId: string) => void
}

export default function MemberItem({
    member,
    isOwner,
    canRemove,
    onRemove
}: MemberItemProps) {
    return (
        <div className="flex items-center justify-center border-b-[1px] border-sky-100 p-2 bg-slate-800">
            <div className="flex items-center w-full justify-between gap-2">
                {/* <Avatar className="h-8 w-8 rounded-full">
                    <AvatarImage src={member.photoURL || undefined} />
                    <AvatarFallback className="bg-cyan-900">{member.displayName.charAt(0)}</AvatarFallback>
                </Avatar> */}
                <div className="text-left">
                    <p className="text-sm flex-1 text-white">{member.displayName}</p>
                    <p className="text-sm text-gray-400">{member.email}</p>
                </div>
                {isOwner && (
                    <span className="ml-2 text-xs bg-blue-500 rounded text-white">
                        {/* Owner */}
                    </span>
                )}
                {canRemove && isOwner && (
                    <Button
                        type="button"
                        onClick={() => onRemove(member.uid)}
                        className="p-1 bg-transparent hover:bg-transparent hover:scale-125 transition-transform"
                        title="Quitar del tablero"
                    >
                        <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                )}
            </div>
        </div>
    )
}