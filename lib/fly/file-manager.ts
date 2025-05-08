import { createClient } from '@supabase/supabase-js';
import { MachineConfig } from './machine';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type FileOperation = {
    path: string;
    content: string;
    operation: 'create' | 'update' | 'delete';
};

export async function updateMachineFiles(machineId: string, files: FileOperation[]) {
    try {
        // Get machine details from Supabase
        const { data: machine, error: fetchError } = await supabase
            .from('machines')
            .select('*')
            .eq('machine_id', machineId)
            .single();

        if (fetchError || !machine) {
            throw new Error('Machine not found');
        }

        // Execute file operations directly on the target machine
        for (const file of files) {
            switch (file.operation) {
                case 'create':
                    // Create directory if it doesn't exist and write file
                    await executeCommand(machineId, `mkdir -p $(dirname /app/${file.path})`);
                    await executeCommand(machineId, `echo '${file.content}' > /app/${file.path}`);
                    break;
                case 'update':
                    // Create directory if it doesn't exist and write file
                    await executeCommand(machineId, `mkdir -p $(dirname /app/${file.path})`);
                    await executeCommand(machineId, `echo '${file.content}' > /app/${file.path}`);
                    break;
                case 'delete':
                    await executeCommand(machineId, `rm -f /app/${file.path}`);
                    break;
            }
        }

        // Update machine status
        await supabase
            .from('machines')
            .update({
                status: 'running',
                updated_at: new Date().toISOString()
            })
            .eq('machine_id', machineId);

        return { success: true };
    } catch (error) {
        console.error('Error updating machine files:', error);
        return { success: false, error: (error as Error).message };
    }
}

async function executeCommand(machineId: string, command: string) {
    const response = await fetch(`${process.env.FLY_API_BASE}/v1/apps/plain-nextjs-app/machines/${machineId}/exec`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.FLY_API_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            command: ['sh', '-c', command]
        })
    });

    if (!response.ok) {
        throw new Error(`Failed to execute command: ${response.statusText}`);
    }

    return response.json();
}

export async function getMachineFiles(machineId: string, path: string = '/app') {
    try {
        const result = await executeCommand(machineId, `find ${path} -type f -exec cat {} \\;`);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function deleteMachineFiles(machineId: string, paths: string[]) {
    try {
        const commands = paths.map(path => `rm -rf /app/${path}`);
        await executeCommand(machineId, commands.join(' && '));
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
} 