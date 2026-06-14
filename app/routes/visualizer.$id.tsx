import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useOutletContext, useParams } from "react-router"
import { gerenate3DView } from "../../lib/ai.action";
import { Box, Download, RefreshCcw, Share, Share2, X } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { createProject, getProjectById } from "../../lib/puter.action";

const VisualizerId = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const {userId} = useOutletContext<AuthContext>();
    const locationState = (location.state || {}) as VisualizerLocationState;

    const hasIniitialGenerated = useRef(false);

    const [project, setProject] = useState<DesignItem | null>(null);
    const [isProjectLoading, setIsProjectLoading] = useState(true);

    const [isProcessing, setIsProcessing] = useState(false);
    const [currentImage, setCurrentImage] = useState<string | null>(null);

    const handleBack = () => navigate('/');

    const runGeneration = async (item: DesignItem) => {
        if(!id || !item.sourceImage) return;
        
        try{
            setIsProcessing(true);
            const result = await gerenate3DView({ sourceImage: item.sourceImage });

            if(result.renderedImage){
                setCurrentImage(result.renderedImage);

                const updatedItem = {
                    ...item,
                    renderedImage: result.renderedImage,
                    renderPath: result.renderedPath,
                    timestamp: Date.now(),
                    ownerId: item.ownerId ?? userId ?? null,
                    isPublic: item.isPublic ?? false,
                };

                const saved = await createProject({item: updatedItem, visibility: "private"})

                if(saved){
                    setProject(saved);
                    setCurrentImage(saved.renderedImage || result.renderedImage);
                }
            }
        } catch(error){
            console.error('Generation Failed: ', error)
        } finally {
            setIsProcessing(false);
        }
        
    }
    useEffect(() => {
    let isMounted = true;

    const loadProject = async () => {
      if (!id) {
        setIsProjectLoading(false);
        return;
      }

      setIsProjectLoading(true);

      // If we have data from navigation state (fresh upload), use it immediately
      // instead of waiting for a potentially failing API call
      if (locationState.initialImage) {
        const fallbackProject: DesignItem = {
          id,
          name: locationState.name || null,
          sourceImage: locationState.initialImage,
          renderedImage: locationState.initialRender || null,
          timestamp: Date.now(),
          ownerId: locationState.ownerId || userId || null,
          sharedBy: locationState.sharedBy || null,
        };
        if (isMounted) {
          setProject(fallbackProject);
          setCurrentImage(fallbackProject.renderedImage || null);
          setIsProjectLoading(false);
          hasIniitialGenerated.current = false;
        }
        return;
      }

      // No navigation state — try to load from backend (e.g. direct URL visit)
      try {
        const fetchedProject = await getProjectById({ id });

        if (!isMounted) return;

        if (fetchedProject) {
          setProject(fetchedProject);
          setCurrentImage(fetchedProject.renderedImage || null);
        }
      } catch (err) {
        console.error('Failed to load project:', err);
      }

      if (isMounted) {
        setIsProjectLoading(false);
        hasIniitialGenerated.current = false;
      }
    };

    loadProject();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (
      isProjectLoading ||
      hasIniitialGenerated.current ||
      !project?.sourceImage
    )
      return;

    if (project.renderedImage) {
      setCurrentImage(project.renderedImage);
      hasIniitialGenerated.current = true;
      return;
    }

    hasIniitialGenerated.current = true;
    void runGeneration(project);
  }, [project, isProjectLoading]);
    

  return (

    <div className="visualizer">
        <nav className="topbar">
            <div className="brand">
                <Box className='logo'/>
                <span className='name'>
                    Roomify
                </span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleBack} className="exit">
                <X className="icon"/> Exit Editor
            </Button>
        </nav>

        <section className="content">
            <div className="panel">
                <div className="panel-header">
                    <div className="panel-meta">
                        <p>Project</p>
                        <h2>{project?.name || `Result ${id}`}</h2>
                        <p className="note">Created by {project?.timestamp ? `on ${new Date(project.timestamp).toLocaleDateString()}` : 'Today'}</p>
                    </div>
                    <div className="panel-actions">
                        <Button size="sm" onClick={() => {}} className="export" disabled ={!currentImage} >
                            <Download className="w-4 h-4 mr-2"/>
                            Export Image
                        </Button>
                        <Button size="sm" onClick={() => {}} className="share">
                            <Share2 className="w-4 h-4 mr-2"/>
                            Share
                        </Button>
                    </div>
                </div>

                <div className= {`render-area ${isProcessing ? 'is-processing': ''}`}>
                    {currentImage ? (
                        <img src={currentImage} alt="render" className="render-img"/>
                    ): (
                        <div className="render-placeholder">
                            {project?.sourceImage && (
                                <img src={project?.sourceImage} alt="original" className="render-fallback"/>
                            )}
                        </div>
                    )}

                    {isProcessing && (
                        <div className="render-overlay">
                            <div className="rendering-card">
                                <RefreshCcw className="spinner"/>
                                <span className="title">Rendering 3D View</span>
                                <span className="subtitle">Please wait, this might take a few seconds...</span>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </section>
    </div>
  )
}

export default VisualizerId