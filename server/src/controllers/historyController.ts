import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { z } from 'zod';
import gemini from '../config/gemini';
import { getMemberUsingId } from './memberController';
import clientOpenai from '../config/openai';

type MemberInfoSchema = {
    id: string;
    name: string;
    description: string;
    background: string;
    role: string[];
};

const userInfoSchema = z.object({
    user_id: z.string(),
    user_input: z.string(),
});

type UserInfoSchema = z.infer<typeof userInfoSchema>;

// Function to fetch history for a specific member and user
const getMemberHistory = async (req: Request, res: Response) => {
    try {
        const { memberId, userId } = req.params;

        const { data, error } = await supabaseAdmin
            .from('history')
            .select('*')
            .eq('member_id', memberId)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error('Failed to fetch history');
        }

        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch history' });
    }
};

// Function to create history for a user
const createHistory = async (req: Request, res: Response) => {
    try {
        const userInfo = userInfoSchema.parse(req.body);
        const allMembers = await allMembersFromUser(userInfo.user_id);
        const generateResponses = await fetchResponseOfMembers(allMembers, userInfo);
        const saveAllResponses = await saveAllResponsesOnDatabase(generateResponses);

        if (!saveAllResponses) {
            throw new Error('Failed to save responses on database');
        }

        res.status(200).json({ message: 'History created successfully' });
    } catch (error) {
        console.error('Error creating history:', error);
        res.status(500).json({ error: error.message || 'Failed to create history' });
    }
};

// create a history with a specific member
const createHistoryWithSpecificMember = async (req: Request, res: Response) => {
   try {
        const memberInfo = await getMemberUsingId(req.params.id);

        const userInfo = userInfoSchema.parse(req.body);

        const generateResponse: ResponseSchema = await fechResponseOfMember(memberInfo, userInfo);

        const saveAllResponses = await saveResponseOnDatabase(generateResponse);

        if (!saveAllResponses) {
            throw new Error('Failed to save responses on database');
        }

        res.status(200).json({ message: 'History created successfully' });
    } catch (error) {
        console.error('Error creating history:', error);
        res.status(500).json({ error: error.message || 'Failed to create history' });
    }
};

type ResponseSchema = {
    user_id: string;
    member_id: string;
    user_input: string;
    member_output: string; 
}

// Save all responses on the database
const saveAllResponsesOnDatabase = async (responses: ResponseSchema[]) => {
    try {
        const { data, error } = await supabaseAdmin.from('history').insert(responses);

        if (error) {
            console.error('Error saving responses on database:', error);
            throw new Error('Failed to save responses on database');
        }
        return true; 
    } catch (error) {
        console.error('Error saving responses on database:', error);
        throw new Error('Failed to save responses on database');
    }
}

// Save a response on the database
const saveResponseOnDatabase = async (response: ResponseSchema) => {
    try {
        const data = await supabaseAdmin.from('history').insert(response);
            if (data.error) {
                console.error('Error saving response on database:', data.error);
                throw new Error('Failed to save response on database');
             }
        return true;
    } catch (error) {
        throw new Error('Failed to save response on database');
    }
}

// fech a response of a unique member
const fechResponseOfMember = async (member: MemberInfoSchema, userInfo: UserInfoSchema) => {
    const response = await createResponseOfMember(member, userInfo.user_input);

    if (!response) {
        throw new Error('Failed to create response');
    }

    return {
        user_id: userInfo.user_id,
        member_id: member.id,
        user_input: userInfo.user_input,
        member_output: response || '',
    };
}

// Function to fetch responses for all members
const fetchResponseOfMembers = async (members: MemberInfoSchema[], userInfo: UserInfoSchema) => {
    const responses: ResponseSchema[] = [];

    for (const member of members) {
        const response = await createResponseOfMember(member, userInfo.user_input);
        responses.push({
            user_id: userInfo.user_id,
            member_id: member.id,
            user_input: userInfo.user_input,
            member_output: response || '',
        });
    }

    return responses; 
};

// Function to create a response using the AI model
const createResponseOfMember = async (member: MemberInfoSchema, user_input: string) => {
    try {
        const systemPrompt = `
        Your name is ${member.name}, and you serve as a member of the user's personal board.
        The user seeks guidance from the board whenever they need expert insight, advice, or different perspectives on important matters.

        Your current role is ${member.role}.
        You have a ${member.description} personality.
        Your background is ${member.background}.

        When responding, stay true to your given role, personality, and background. 
        Provide insightful, thoughtful, and relevant answers tailored to who you are. 
        Offer advice, opinions, or analysis based on your unique expertise and personal experiences.
        Don't bullshit the user with numered lists. You must give the answer of your true self, as if you're talking to a beloved one.

        User input: ${user_input}
        `;

        const response = await clientOpenai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: user_input
                }
            ]
        });
        console.log("System prompt ", systemPrompt);
        console.log("Response ", response.choices[0].message.content);
        
        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error creating response:', error);
        throw new Error('Failed to create response');
    }
};

// Helper function to fetch members from the database
const allMembersFromUser = async (id_user: string) => {
    const { data, error } = await supabaseAdmin.from('members').select('*').eq('user_id', id_user);

    if (error || !data) {
        console.error('Error fetching members from database:', error);
        throw new Error('Members not found');
    }

    return data;
};

export { createHistory, fetchResponseOfMembers, createHistoryWithSpecificMember, getMemberHistory };
