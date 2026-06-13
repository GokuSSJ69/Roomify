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

export const createProject = async ({ item }: CreateProjectParams): Promise<DesignItem | null | undefined> => {
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
        // call the puter worker

        return payload;

    } catch (e) {
        console.log('Fail to save', e)
        return null;
    }

}