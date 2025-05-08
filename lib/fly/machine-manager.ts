import { createClient } from '@supabase/supabase-js';
import { createMachine, stopMachine, restartMachine, deleteMachine, type MachineConfig } from './machine';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type MachineInfo = {
    id: string;
    user_id: string;
    machine_id: string;
    name: string;
    region: string;
    status: 'running' | 'stopped' | 'error';
    created_at: string;
    updated_at: string;
};

export async function assignMachineToUser(userId: string, websiteName: string) {
    try {
        // Generate a unique machine name
        const machineName = `${websiteName}-${userId.slice(0, 8)}`;

        // Create machine configuration for users Fly.io machine
        const config: MachineConfig = {
            name: machineName,
            region: 'arn',
            image: 'registry.fly.io/plain-nextjs-app:deployment-9824ac950e095e93223427935bb49dbf',
            guest: {
                cpu_kind: 'shared',
                cpus: 1,
                memory_mb: 1024,
            },
            restart: {
                policy: 'on-failure'
            }
        };

        // Create the machine on Fly.io
        const machine = await createMachine(config);

        // Store machine info in Supabase
        const { data, error } = await supabase
            .from('machines')
            .insert({
                user_id: userId,
                machine_id: machine.id,
                name: machineName,
                region: config.region,
                status: 'running',
            })
            .select()
            .single();

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Error assigning machine:', error);
        return { success: false, error: (error as Error).message };
    }
}

export async function getUserMachines(userId: string) {
    try {
        const { data, error } = await supabase
            .from('machines')
            .select('*')
            .eq('user_id', userId);

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function startUserMachine(userId: string, machineId: string) {
    try {
        // Verify machine ownership
        const { data: machine, error: fetchError } = await supabase
            .from('machines')
            .select('*')
            .eq('user_id', userId)
            .eq('machine_id', machineId)
            .single();

        if (fetchError || !machine) {
            throw new Error('Machine not found or unauthorized');
        }

        // Start the machine
        await restartMachine(machineId);

        // Update status in database
        const { error: updateError } = await supabase
            .from('machines')
            .update({ status: 'running' })
            .eq('id', machine.id);

        if (updateError) throw updateError;

        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function stopUserMachine(userId: string, machineId: string) {
    try {
        // Verify machine ownership
        const { data: machine, error: fetchError } = await supabase
            .from('machines')
            .select('*')
            .eq('user_id', userId)
            .eq('machine_id', machineId)
            .single();

        if (fetchError || !machine) {
            throw new Error('Machine not found or unauthorized');
        }

        // Stop the machine
        await stopMachine(machineId);

        // Update status in database
        const { error: updateError } = await supabase
            .from('machines')
            .update({ status: 'stopped' })
            .eq('id', machine.id);

        if (updateError) throw updateError;

        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function deleteUserMachine(userId: string, machineId: string) {
    try {
        // Verify machine ownership
        const { data: machine, error: fetchError } = await supabase
            .from('machines')
            .select('*')
            .eq('user_id', userId)
            .eq('machine_id', machineId)
            .single();

        if (fetchError || !machine) {
            throw new Error('Machine not found or unauthorized');
        }

        // Delete the machine
        await deleteMachine(machineId);

        // Remove from database
        const { error: deleteError } = await supabase
            .from('machines')
            .delete()
            .eq('id', machine.id);

        if (deleteError) throw deleteError;

        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
} 