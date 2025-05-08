'use server';

import {
    createMachine,
    getMachine,
    listMachines,
    restartMachine,
    stopMachine,
    deleteMachine,
    updateMachine,
    type MachineConfig,
} from '@/lib/fly/machine';

export async function createFlyMachine(config: MachineConfig) {
    try {
        const result = await createMachine(config);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function getFlyMachine(machineId: string) {
    try {
        const result = await getMachine(machineId);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function listFlyMachines() {
    try {
        const result = await listMachines();
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function restartFlyMachine(machineId: string) {
    try {
        const result = await restartMachine(machineId);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function stopFlyMachine(machineId: string) {
    try {
        const result = await stopMachine(machineId);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function deleteFlyMachine(machineId: string) {
    try {
        const result = await deleteMachine(machineId);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function updateFlyMachine(machineId: string, config: Partial<MachineConfig>) {
    try {
        const result = await updateMachine(machineId, config);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
} 