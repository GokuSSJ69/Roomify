
import { PUTER_WORKER_URL } from "./constants";
import { getPuter } from "./puter.client";
import { getOrCreateHostingConfig, uploadImageToHosting } from "./puter.hosting";
import { isHostedUrl } from "./utils";

export const signIn = async () => {
    const puter = await getPuter();
    return await puter.auth.signIn();
};

export const signOut = async () => {
    const puter = await getPuter();
    puter.auth.signOut();
};

export const getCurrentUser = async () => {
    try {
        const puter = await getPuter();
        return await puter.auth.getUser();
    } catch {
        return null;
    }
}

export const createProject = async ({ item, visibility = "private" }: CreateProjectParams): Promise<DesignItem | null | undefined> => {
    if(!PUTER_WORKER_URL){
        console.warn('Puter worker URL is not defined');
        return null;
    }

    const projectId = item.id;

    const hosting = await getOrCreateHostingConfig();
    const hostedSource = projectId ? await uploadImageToHosting({
        hosting, url: item.sourceImage, projectId, label: "source"
    }) : null;

    const hostedRendered = projectId && item.renderedImage ? await uploadImageToHosting({
        hosting, url: item.renderedImage, projectId, label: "rendered"
    }) : null;

    const resolvedSource = hostedSource?.url || (isHostedUrl(item.sourceImage) ? item.sourceImage : '');

    if (!resolvedSource) {
        console.warn('could not determine resolved source');
        return null;
    }

    const resolvedRendered = hostedRendered?.url ? hostedRendered?.url : item.renderedImage && isHostedUrl(item.renderedImage) ? item.renderedImage : undefined;

    const {
        sourcePath: _sourcePath,
        renderedPath: _renderedPath,
        publicPath: _publicPath,
        ...rest
    } = item;

    const payload = {
        ...rest,
        sourceImage: resolvedSource,
        renderedImage: resolvedRendered,
    }

    try {
        const p = await getPuter();
        const response = await p.workers.exec(`${PUTER_WORKER_URL}/api/projects/save`,{method:'POST', headers:{ 'Content-Type': 'application/json'}, body: JSON.stringify({project: payload, visibility}) });

        if(!response.ok){
            console.error('failed to save project', await response.text());
            return null;
        }

        const data = (await response.json()) as { project?: DesignItem | null };

        return data?.project ?? null;

    } catch (e) {
        console.log('Fail to save', e)
        return null;
    }

}

export const getProject = async () => {
    if(!PUTER_WORKER_URL){
        console.warn('Puter worker URL is not defined');
        return [];
    }

    try {
        const p = await getPuter();
        const response = await p.workers.exec(`${PUTER_WORKER_URL}/api/projects/list`,{method:'GET'});

        if(!response.ok){
            console.error('failed to fetch projects', await response.text());
            return [];
        }
        
        const data = (await response.json()) as{
            projects?: DesignItem[] | null;
        }

        return Array.isArray(data?.projects) ? data?.projects : [];

    } catch (e) {
        console.error('failed to fetch projects', e);
        return [];
    }
}

export const getProjectById = async ({ id }: { id: string }) => {
    if (!PUTER_WORKER_URL) {
        console.warn("Missing VITE_PUTER_WORKER_URL; skipping project fetch.");
        return null;
    }

    console.log("Fetching project with ID:", id);

    try {
        const p = await getPuter();
        const response = await p.workers.exec(
            `${PUTER_WORKER_URL}/api/projects/get?id=${encodeURIComponent(id)}`,
            { method: "GET" },
        );

        console.log("Fetch project response:", response);

        if (!response.ok) {
            console.error("Failed to fetch project:", await response.text());
            return null;
        }

        const data = (await response.json()) as {
            project?: DesignItem | null;
        };

        console.log("Fetched project data:", data);

        return data?.project ?? null;
    } catch (error) {
        console.error("Failed to fetch project:", error);
        return null;
    }
};