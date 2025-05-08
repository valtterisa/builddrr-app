'use server';

import { assignMachineToUser, getUserMachines, startUserMachine, stopUserMachine, deleteUserMachine } from '@/lib/fly/machine-manager';
import { createClient } from '@supabase/supabase-js';
import { updateMachineFiles, getMachineFiles, deleteMachineFiles, type FileOperation } from '@/lib/fly/file-manager';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function createWebsite(userId: string, websiteName: string) {
    try {
        // First, assign a machine to the user
        const machineResult = await assignMachineToUser(userId, websiteName);

        if (!machineResult.success) {
            throw new Error(machineResult.error);
        }

        // Create website record in Supabase
        const { data: website, error } = await supabase
            .from('websites')
            .insert({
                user_id: userId,
                name: websiteName,
                machine_id: machineResult.data.machine_id,
                status: 'creating'
            })
            .select()
            .single();

        if (error) throw error;

        return { success: true, data: { website, machine: machineResult.data } };
    } catch (error) {
        console.error('Error creating website:', error);
        return { success: false, error: (error as Error).message };
    }
}

export async function getUserWebsites(userId: string) {
    try {
        // Get all machines for the user
        const machinesResult = await getUserMachines(userId);

        if (!machinesResult.success) {
            throw new Error(machinesResult.error);
        }

        // Get all websites for the user
        const { data: websites, error } = await supabase
            .from('websites')
            .select('*')
            .eq('user_id', userId);

        if (error) throw error;

        // Combine website and machine information
        const websitesWithMachines = websites.map(website => {
            const machine = machinesResult.data?.find(m => m.machine_id === website.machine_id);
            return {
                ...website,
                machine
            };
        });

        return { success: true, data: websitesWithMachines };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function startWebsite(userId: string, websiteId: string) {
    try {
        // Get website and verify ownership
        const { data: website, error: fetchError } = await supabase
            .from('websites')
            .select('*')
            .eq('id', websiteId)
            .eq('user_id', userId)
            .single();

        if (fetchError || !website) {
            throw new Error('Website not found or unauthorized');
        }

        // Start the machine
        const result = await startUserMachine(userId, website.machine_id);

        if (!result.success) {
            throw new Error(result.error);
        }

        // Update website status
        const { error: updateError } = await supabase
            .from('websites')
            .update({ status: 'running' })
            .eq('id', websiteId);

        if (updateError) throw updateError;

        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function stopWebsite(userId: string, websiteId: string) {
    try {
        // Get website and verify ownership
        const { data: website, error: fetchError } = await supabase
            .from('websites')
            .select('*')
            .eq('id', websiteId)
            .eq('user_id', userId)
            .single();

        if (fetchError || !website) {
            throw new Error('Website not found or unauthorized');
        }

        // Stop the machine
        const result = await stopUserMachine(userId, website.machine_id);

        if (!result.success) {
            throw new Error(result.error);
        }

        // Update website status
        const { error: updateError } = await supabase
            .from('websites')
            .update({ status: 'stopped' })
            .eq('id', websiteId);

        if (updateError) throw updateError;

        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function deleteWebsite(userId: string, websiteId: string) {
    try {
        // Get website and verify ownership
        const { data: website, error: fetchError } = await supabase
            .from('websites')
            .select('*')
            .eq('id', websiteId)
            .eq('user_id', userId)
            .single();

        if (fetchError || !website) {
            throw new Error('Website not found or unauthorized');
        }

        // Delete the machine
        const result = await deleteUserMachine(userId, website.machine_id);

        if (!result.success) {
            throw new Error(result.error);
        }

        // Delete website record
        const { error: deleteError } = await supabase
            .from('websites')
            .delete()
            .eq('id', websiteId);

        if (deleteError) throw deleteError;

        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function updateWebsiteFiles(userId: string, websiteId: string, files: FileOperation[]) {
    try {
        // Get website and verify ownership
        const { data: website, error: fetchError } = await supabase
            .from('websites')
            .select('*')
            .eq('id', websiteId)
            .eq('user_id', userId)
            .single();

        if (fetchError || !website) {
            throw new Error('Website not found or unauthorized');
        }

        // Get machine details
        const { data: machine, error: machineError } = await supabase
            .from('machines')
            .select('*')
            .eq('machine_id', website.machine_id)
            .single();

        if (machineError || !machine) {
            throw new Error('Machine not found');
        }

        // Update files on the machine
        const result = await updateMachineFiles(machine.machine_id, files);

        if (!result.success) {
            throw new Error(result.error);
        }

        // Update website content in database
        const { error: updateError } = await supabase
            .from('websites')
            .update({
                content: {
                    ...website.content,
                    last_updated: new Date().toISOString()
                }
            })
            .eq('id', websiteId);

        if (updateError) throw updateError;

        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function getWebsiteFiles(userId: string, websiteId: string) {
    try {
        // Get website and verify ownership
        const { data: website, error: fetchError } = await supabase
            .from('websites')
            .select('*')
            .eq('id', websiteId)
            .eq('user_id', userId)
            .single();

        if (fetchError || !website) {
            throw new Error('Website not found or unauthorized');
        }

        // Get files from the machine
        const result = await getMachineFiles(website.machine_id);

        if (!result.success) {
            throw new Error(result.error);
        }

        return { success: true, data: result.data };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function deleteWebsiteFiles(userId: string, websiteId: string, paths: string[]) {
    try {
        // Get website and verify ownership
        const { data: website, error: fetchError } = await supabase
            .from('websites')
            .select('*')
            .eq('id', websiteId)
            .eq('user_id', userId)
            .single();

        if (fetchError || !website) {
            throw new Error('Website not found or unauthorized');
        }

        // Delete files from the machine
        const result = await deleteMachineFiles(website.machine_id, paths);

        if (!result.success) {
            throw new Error(result.error);
        }

        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
} 