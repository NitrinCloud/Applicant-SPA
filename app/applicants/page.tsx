import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { revalidatePath } from "next/cache"
import Link from "next/link"

export default async function ApplicantsPage() {
    const res = await fetch(process.env.API + "/applicants")
    const data: { id: number, name: string, documents: { id: number, documentName: string }[] }[] = await res.json()

    return (
        <main className="p-24">
            <div className="flex justify-between items-center">
                <h1 className="text-5xl font-extrabold">Bewerber</h1>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>
                            Bewerber anlegen
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Bewerber neu anlegen</DialogTitle>
                        </DialogHeader>
                        <div className="flex justify-center items-center">
                            <form className="mt-6 w-2/3 flex flex-col gap-3" action={async (formData) => {
                                "use server"
                                const res = await fetch(process.env.API + "/applicants", {
                                    method: "post",
                                    headers: {
                                        "Content-Type": "application/json"
                                    },
                                    body: JSON.stringify({
                                        name: formData.get("name")
                                    })
                                })
                                const document = formData.get("document")
                                if (document) {
                                    const fileData = new FormData()
                                    fileData.append("file", document)
                                    const applicant: { id: number, name: string, documents: { id: number, documentName: string }[] } = await res.json()
                                    await fetch(process.env.API + "/" + applicant.id + "/documents/upload", {
                                        method: "post",
                                        body: fileData
                                    })
                                }
                                revalidatePath("/applicants")
                            }}>
                                <div>
                                    <Label htmlFor="name">Name</Label>
                                    <Input type="text" id="name" name="name" required />
                                </div>
                                <div>
                                    <Label htmlFor="document">Dokument</Label>
                                    <Input type="file" id="document" name="document" required />
                                </div>
                                <DialogClose asChild>
                                    <Button type="submit" className="mt-4">Erstellen</Button>
                                </DialogClose>
                            </form>
                        </div>
                    </DialogContent>
                </Dialog>

            </div>
            <div className="mt-20 grid grid-cols-3 gap-6">
                {data.map((applicant) => (
                    <Card key={applicant.id}>
                        <CardHeader className="text-3xl flex flex-row justify-between items-center">
                            {applicant.name}
                            <form>
                                <Button variant="ghost" className="p-2" formAction={async () => {
                                    "use server"
                                    await fetch(process.env.API + "/applicants/" + applicant.id, {
                                        method: "delete"
                                    })
                                    revalidatePath("/applicants")
                                }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m9.4 16.5l2.6-2.6l2.6 2.6l1.4-1.4l-2.6-2.6L16 9.9l-1.4-1.4l-2.6 2.6l-2.6-2.6L8 9.9l2.6 2.6L8 15.1zM5 21V6H4V4h5V3h6v1h5v2h-1v15z" /></svg>
                                </Button>
                            </form>
                        </CardHeader>
                        <CardContent className="flex flex-col">
                            <span className="font-bold">{applicant.name} hat {applicant.documents.length} Dokumente:</span>
                            {applicant.documents.map((document) => (
                                <span key={document.id}>- <Button variant="link" asChild>
                                    <Link href={process.env.API + "/" + applicant.id + "/documents/" + document.id + "/download"}>
                                        {document.documentName}
                                    </Link>
                                </Button></span>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </main>
    )
}