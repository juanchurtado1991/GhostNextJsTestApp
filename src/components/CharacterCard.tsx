import {GhostCharacter} from "@/models/types";
import {Card} from "./Card";
import {SampleText} from "./SampleText";
import {StatusIndicator} from "./StatusIndicator";
import Image from "next/image";

interface CharacterCardProps {
    character: GhostCharacter;
}

export function CharacterCard({character}: CharacterCardProps) {
    return (
        <Card
            className="flex flex-row items-center p-0 overflow-hidden bg-[#1E293B]/50 border-white/10 hover:border-purple-500/30 transition-all duration-300 group">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl m-4">
                <Image
                    src={character.image}
                    alt={character.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-r from-black/10 to-transparent"/>
            </div>

            <div className="flex flex-1 flex-col pr-4 py-4 justify-center">
                <div className="flex items-center justify-between">
                    <SampleText text={character.name} isBold={true} fontSize={16} overrideColor="#F8FAFC"/>
                </div>

                <StatusIndicator status={character.status}/>

                <SampleText
                    text={character.species}
                    fontSize={12}
                    isSecondary={true}
                />

                <div
                    className="mt-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-1 h-1 rounded-full bg-[#A855F7]"/>
                    <span
                        className="text-[8px] font-bold text-[#A855F7]/80 tracking-tighter uppercase">GHOST VERIFIED</span>
                </div>
            </div>
        </Card>
    );
}
