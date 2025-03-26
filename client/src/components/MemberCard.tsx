import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import MemberProfile from "./MemberProfile";

interface MemberCardProps {
    name: string;
    role: string;
    image: string;   
}

export default function MemberCard({ name, role, image }: MemberCardProps) {
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    return (
        <>
            <Card className="w-[1/4]">
                <CardHeader>
                    <img src={image} alt={name} className="rounded-full w-12 h-12" />
                    <CardTitle>{name}</CardTitle>
                    <CardDescription>{role}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Summary of what {name} thinks about the problem</p>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button onClick={() => setIsProfileOpen(true)}>See more</Button>
                </CardFooter>
            </Card>

            <MemberProfile
                open={isProfileOpen}
                onOpenChange={setIsProfileOpen}
                name={name}
                role={role}
                image={image}
            />
        </>
    )
}
