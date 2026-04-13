import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
    const body = await req.json()
    console.log("Body:",body)
    const content = body.content

    const { id } = await params   

    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { error } = await supabase
        .from("notes")
        .insert([
        {
            client_id: Number(id),   
            note: content,
        },
        ])
    if (error) {
        console.error("INSERT ERROR:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}