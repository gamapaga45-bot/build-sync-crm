/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { IFCLoader } from 'web-ifc-three/IFCLoader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Box, 
  Maximize2, 
  Minimize2,
  Layers, 
  Eye, 
  RotateCw, 
  ZoomIn, 
  ZoomOut,
  Upload,
  Info,
  MessageSquare,
  Plus,
  Link as LinkIcon,
  EyeOff,
  Search,
  X,
  Target
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface BimViewerProps {
  highlightId?: string | null;
  onHighlightComplete?: () => void;
}

export default function BimViewer({ highlightId, onHighlightComplete }: BimViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerWrapperRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const ifcLoaderRef = useRef<IFCLoader | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      // Trigger resize to update Three.js canvas after a short delay to allow DOM to update
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!viewerWrapperRef.current) return;

    if (!document.fullscreenElement) {
      viewerWrapperRef.current.requestFullscreen().catch((err) => {
        toast.error(`Ошибка при переходе в полноэкранный режим: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // slate-900
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(45, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.set(10, 10, 10);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const light1 = new THREE.DirectionalLight(0xffffff, 1);
    light1.position.set(1, 1, 1).normalize();
    scene.add(light1);

    const light2 = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(light2);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // IFC Loader setup
    const ifcLoader = new IFCLoader();
    // Use CDN for WASM files
    ifcLoader.ifcManager.setWasmPath('https://unpkg.com/web-ifc@0.0.36/');
    ifcLoaderRef.current = ifcLoader;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Raycaster for selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current || !ifcLoaderRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        const obj = intersects[0].object;
        // In web-ifc-three, we can get the element ID
        ifcLoaderRef.current.ifcManager.getItemProperties(0, (obj as any).expressID, false).then((props) => {
          setSelectedElement({
            id: (obj as any).expressID,
            name: props.Name?.value || 'Без имени',
            type: props.ObjectType?.value || 'Элемент IFC',
            properties: props
          });
        });
      } else {
        setSelectedElement(null);
      }
    };

    containerRef.current.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeEventListener('click', handleClick);
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (highlightId && modelLoaded) {
      const expressId = parseInt(highlightId);
      if (!isNaN(expressId)) {
        focusOnElement(expressId).then(() => {
          onHighlightComplete?.();
        });
      } else {
        onHighlightComplete?.();
      }
    }
  }, [highlightId, modelLoaded, onHighlightComplete]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !ifcLoaderRef.current || !sceneRef.current) return;

    setLoading(true);
    const url = URL.createObjectURL(file);

    try {
      ifcLoaderRef.current.load(url, (ifcModel) => {
        if (sceneRef.current) {
          sceneRef.current.add(ifcModel);
          // Tag objects with their expressID if they don't have it
          // web-ifc-three models usually are single meshes, but let's ensure we can find things
          ifcModel.traverse((child) => {
            if ((child as any).isMesh) {
              // The model itself is usually a mesh with grouped indices
            }
          });
        }
        setModelLoaded(true);
        setLoading(false);
        toast.success("Модель успешно загружена");
        
        // Center camera on model
        const box = new THREE.Box3().setFromObject(ifcModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        cameraRef.current?.position.set(center.x + maxDim, center.y + maxDim, center.z + maxDim);
        cameraRef.current?.lookAt(center);
      });
    } catch (error) {
      console.error("Error loading IFC:", error);
      toast.error("Ошибка при загрузке модели");
      setLoading(false);
    }
  };

  const focusOnElement = async (expressId: number) => {
    if (!ifcLoaderRef.current || !sceneRef.current) return;

    try {
      const props = await ifcLoaderRef.current.ifcManager.getItemProperties(0, expressId, false);
      setSelectedElement({
        id: expressId,
        name: props.Name?.value || 'Без имени',
        type: props.ObjectType?.value || 'Элемент IFC',
        properties: props
      });

      // Simple highlight logic: move camera
      // Since it's a single mesh, we need to get the bounds of the specific expressID
      // This is complex in web-ifc-three without subsets, but we can try to find 
      // where the specific IDs were placed or just zoom to the model center if we can't find bounds
      
      // Attempt to find if there's a specific object for this ID (sometimes loaders split them)
      let found = false;
      sceneRef.current.traverse((child) => {
        if ((child as any).expressID === expressId) {
          const box = new THREE.Box3().setFromObject(child);
          const center = box.getCenter(new THREE.Vector3());
          cameraRef.current?.lookAt(center);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          cameraRef.current?.position.set(center.x + maxDim * 2, center.y + maxDim * 2, center.z + maxDim * 2);
          found = true;
        }
      });

      if (!found) {
        toast.info(`Элемент ID ${expressId} выбран (координаты не найдены)`);
      } else {
        toast.success(`Элемент ${expressId} найден и сфокусирован`);
      }
    } catch (err) {
      toast.error("Элемент не найден или ошибка при получении свойств");
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !modelLoaded) return;

    const id = parseInt(searchQuery);
    if (!isNaN(id)) {
      await focusOnElement(id);
    } else {
      toast.info("Поиск по имени в данной версии ограничен ID. Попробуйте ввести числовой ID.");
    }
    setSearchQuery('');
    setShowSearch(false);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">BIM Просмотрщик</h2>
          <p className="text-slate-500 text-sm">Интерактивная 3D модель объекта (IFC)</p>
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            accept=".ifc"
            onChange={handleFileUpload}
            className="hidden"
            id="ifc-upload"
          />
          <Button variant="outline" size="sm" asChild>
            <label htmlFor="ifc-upload" className="cursor-pointer">
              <Upload className="w-4 h-4 mr-2" /> Загрузить IFC
            </label>
          </Button>
          <Button variant="outline" size="sm">
            <Layers className="w-4 h-4 mr-2" /> Слои
          </Button>
          <Button 
            variant={showSearch ? "secondary" : "outline"} 
            size="sm"
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search className="w-4 h-4 mr-2" /> Поиск
          </Button>
          <Button className="bg-slate-900" onClick={toggleFullscreen}>
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4 mr-2" /> Свернуть
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 mr-2" /> Полный экран
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Viewer Area */}
        <Card 
          ref={viewerWrapperRef}
          className={cn(
            "lg:col-span-3 border-none shadow-sm bg-slate-900 overflow-hidden relative min-h-[600px]",
            isFullscreen && "fixed inset-0 z-50 w-screen h-screen rounded-none"
          )}
        >
          <div ref={containerRef} className="absolute inset-0 w-full h-full" />
          
          {showSearch && modelLoaded && (
            <div className="absolute top-6 left-6 right-6 z-30">
              <form onSubmit={handleSearch} className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  autoFocus
                  placeholder="Поиск по ID (напр: 1245)..." 
                  className="pl-10 pr-10 bg-white/90 backdrop-blur-md border-none shadow-xl h-12 rounded-2xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button 
                  type="button"
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowSearch(false)}
                >
                  <X size={16} />
                </Button>
              </form>
            </div>
          )}

          {!modelLoaded && !loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 space-y-4 bg-slate-900/50 backdrop-blur-sm">
              <Box size={64} className="opacity-20" />
              <p className="text-lg">Загрузите IFC файл для начала работы</p>
              <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800" asChild>
                <label htmlFor="ifc-upload" className="cursor-pointer">Выбрать файл</label>
              </Button>
            </div>
          )}

          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-4 bg-slate-900/80 backdrop-blur-md z-20">
              <Skeleton className="absolute inset-0 bg-slate-800/50" />
              <div className="relative z-30 flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4" />
                <p className="font-medium">Обработка BIM модели...</p>
              </div>
            </div>
          )}

          {/* Controls Overlay */}
          {modelLoaded && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 z-10">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </Button>
              <div className="w-px h-6 bg-white/10 mx-1" />
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20"><RotateCw size={18} /></Button>
              <div className="w-px h-6 bg-white/10 mx-1" />
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20"><ZoomIn size={18} /></Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20"><ZoomOut size={18} /></Button>
              <div className="w-px h-6 bg-white/10 mx-1" />
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20"><Eye size={18} /></Button>
            </div>
          )}
        </Card>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Info size={16} className="text-blue-500" />
                Свойства элемента
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedElement ? (
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">{selectedElement.type}</p>
                    <p className="text-sm font-bold text-slate-900">{selectedElement.name}</p>
                    <p className="text-[10px] text-slate-400 mt-1">ID: {selectedElement.id}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase">Параметры</p>
                    <div className="max-h-[200px] overflow-auto space-y-1 pr-2">
                      {Object.entries(selectedElement.properties).map(([key, val]: [string, any], i) => (
                        val?.value !== undefined && (
                          <div key={i} className="flex justify-between text-[11px] py-1 border-b border-slate-50">
                            <span className="text-slate-500">{key}</span>
                            <span className="font-medium text-slate-900 text-right ml-2">{String(val.value)}</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button size="sm" variant="outline" className="text-xs">
                      <MessageSquare size={14} className="mr-1" /> Коммент
                    </Button>
                    <Button size="sm" className="text-xs bg-slate-900">
                      <Plus size={14} className="mr-1" /> Задача
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center gap-2">
                  <EyeOff size={24} className="text-slate-300" />
                  <p className="text-xs text-slate-400 italic">Выберите элемент на модели для просмотра свойств</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <LinkIcon size={16} className="text-purple-500" />
                Связанные объекты
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedElement ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded uppercase">Ошибка</span>
                      <span className="text-[10px] text-slate-400">#TSK-42</span>
                    </div>
                    <p className="text-sm font-medium text-slate-900 line-clamp-1">Трещина в плите перекрытия</p>
                  </div>
                  <Button variant="ghost" size="sm" className="w-full text-xs text-slate-500 hover:text-slate-900">
                    + Привязать задачу или материал
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-4 italic">Нет выбранного элемента</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
