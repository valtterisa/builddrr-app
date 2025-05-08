import { z } from 'zod';

const FLY_API_BASE = process.env.FLY_API_BASE!;

// Types
export const MachineConfigSchema = z.object({
    name: z.string(),
    region: z.string(),
    image: z.string(),
    guest: z.object({
        cpu_kind: z.enum(['shared', 'performance']),
        cpus: z.number().optional(),
        memory_mb: z.number().optional(),
        kernel_args: z.array(z.string()).optional(),
    }),
    env: z.record(z.string()).optional(),
    services: z.array(z.object({
        protocol: z.enum(['tcp', 'udp']),
        internal_port: z.number(),
        concurrency: z.object({
            type: z.enum(['connections', 'requests']).optional(),
            soft_limit: z.number().optional(),
            hard_limit: z.number().optional()
        }).optional(),
        ports: z.array(z.object({
            port: z.number().optional(),
            start_port: z.number().optional(),
            end_port: z.number().optional(),
            handlers: z.array(z.string()).optional(),
            force_https: z.boolean().optional(),
            http_options: z.object({
                compress: z.boolean().optional(),
                h2_backend: z.boolean().optional(),
                response: z.object({
                    headers: z.record(z.string()).optional(),
                    pristine: z.boolean().optional()
                }).optional()
            }).optional(),
            tls_options: z.object({
                alpn: z.array(z.string()).optional(),
                default_self_signed: z.boolean().optional(),
                versions: z.array(z.string()).optional()
            }).optional(),
            proxy_proto_options: z.object({
                version: z.string().optional()
            }).optional()
        })).optional(),
        autostart: z.boolean().optional(),
        autostop: z.union([z.boolean(), z.enum(['off', 'stop', 'suspend'])]).optional(),
        min_machines_running: z.number().optional()
    })).optional(),
    mounts: z.array(z.object({
        volume: z.string(),
        path: z.string(),
        name: z.string().optional(),
        extend_threshold_percent: z.number().optional(),
        add_size_gb: z.number().optional(),
        size_gb_limit: z.number().optional(),
        encrypted: z.boolean().optional()
    })).optional(),
    processes: z.array(z.object({
        entrypoint: z.array(z.string()).optional(),
        cmd: z.array(z.string()).optional(),
        env: z.record(z.string()).optional(),
        env_from: z.array(z.any()).optional(),
        exec: z.array(z.string()).optional(),
        user: z.string().optional(),
        ignore_app_secrets: z.boolean().optional(),
        secrets: z.array(z.object({
            env_var: z.string(),
            name: z.string().optional()
        })).optional()
    })).optional(),
    restart: z.object({
        policy: z.enum(['no', 'on-failure', 'always']),
        max_retries: z.number().optional()
    }).optional(),
    schedule: z.enum(['hourly', 'daily', 'weekly', 'monthly']).optional(),
    standbys: z.array(z.string()).optional(),
    statics: z.array(z.object({
        guest_path: z.string(),
        url_prefix: z.string(),
        tigris_bucket: z.string().optional(),
        index_document: z.string().optional()
    })).optional(),
    stop_config: z.object({
        signal: z.string().optional(),
        timeout: z.number().optional()
    }).optional()
});

export type MachineConfig = z.infer<typeof MachineConfigSchema>;

// Helper function to make authenticated API calls
async function flyApiRequest(endpoint: string, options: RequestInit = {}) {
    const FLY_API_TOKEN = process.env.FLY_API_TOKEN;

    if (!FLY_API_TOKEN) {
        throw new Error('FLY_API_TOKEN is not set');
    }

    const response = await fetch(`${FLY_API_BASE}${endpoint}`, {
        ...options,
        headers: {
            'Authorization': `Bearer ${FLY_API_TOKEN}`,
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`Fly.io API error: ${response.status} ${JSON.stringify(error)}`);
    }

    return response.json();
}

// Create a new machine
export async function createMachine(config: MachineConfig) {
    return flyApiRequest(`/v1/apps/plain-nextjs-app/machines`, {
        method: 'POST',
        body: JSON.stringify(config),
    });
}

// Get machine details
export async function getMachine(machineId: string) {
    return flyApiRequest(`/v1/apps/plain-nextjs-app/machines/${machineId}`);
}

// List all machines in an app
export async function listMachines() {
    return flyApiRequest(`/v1/apps/plain-nextjs-app/machines`);
}

// Restart a machine
export async function restartMachine(machineId: string) {
    return flyApiRequest(`/v1/apps/plain-nextjs-app/machines/${machineId}/restart`, {
        method: 'POST',
    });
}

// Stop a machine
export async function stopMachine(machineId: string) {
    return flyApiRequest(`/v1/apps/plain-nextjs-app/machines/${machineId}/stop`, {
        method: 'POST',
    });
}

// Delete a machine
export async function deleteMachine(machineId: string) {
    return flyApiRequest(`/v1/apps/plain-nextjs-app/machines/${machineId}`, {
        method: 'DELETE',
    });
}

// Update machine configuration
export async function updateMachine(machineId: string, config: Partial<MachineConfig>) {
    return flyApiRequest(`/v1/apps/plain-nextjs-app/machines/${machineId}`, {
        method: 'PATCH',
        body: JSON.stringify(config),
    });
} 