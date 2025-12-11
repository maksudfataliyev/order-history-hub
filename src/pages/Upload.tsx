import { useState } from 'react';
import { Upload as UploadIcon, X, ImagePlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useListings } from '@/contexts/ListingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const categories = ['sofa', 'chair', 'table', 'bed', 'storage', 'desk'] as const;
const conditions = ['new', 'likeNew', 'good', 'fair'] as const;

const getConditionLabel = (cond: string, t: ReturnType<typeof useLanguage>['t']) => {
  const conditionMap: Record<string, string> = {
    new: t.catalog.new,
    likeNew: t.catalog.likeNew,
    good: t.catalog.good,
    fair: t.catalog.fair,
  };
  return conditionMap[cond] || cond;
};

const Upload = () => {
  const { t } = useLanguage();
  const { addListing } = useListings();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [images, setImages] = useState<string[]>([]);
  const [acceptBarter, setAcceptBarter] = useState(true);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [price, setPrice] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [depth, setDepth] = useState('');
  const [description, setDescription] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...newImages].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: 'Error',
        description: 'Please login to submit a listing',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    if (!name || !category || !condition || !price) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    addListing({
      name,
      category,
      condition,
      price: parseFloat(price) || 0,
      description,
      images,
      dimensions: {
        width: parseFloat(width) || 0,
        height: parseFloat(height) || 0,
        depth: parseFloat(depth) || 0,
      },
      acceptsBarter: acceptBarter,
    });

    toast({
      title: 'Success!',
      description: 'Your listing has been submitted for review.',
    });

    // Reset form
    setName('');
    setCategory('');
    setCondition('');
    setPrice('');
    setWidth('');
    setHeight('');
    setDepth('');
    setDescription('');
    setImages([]);
    setAcceptBarter(true);

    navigate('/dashboard?tab=mylistings');
  };

  return (
    <Layout>
      <div className="container-custom py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
              {t.upload.title}
            </h1>
            <p className="text-muted-foreground">
              {t.upload.subtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Image Upload */}
            <div>
              <Label className="text-lg font-semibold mb-4 block">{t.upload.images}</Label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                {images.map((img, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={img}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover rounded-xl border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <label className="aspect-square border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors">
                    <ImagePlus className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-xs text-muted-foreground text-center px-2">
                      {t.upload.dragDrop}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <Label htmlFor="name">{t.upload.name}</Label>
                <Input 
                  id="name" 
                  placeholder="e.g., Vintage Oak Armchair" 
                  className="mt-2" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="category">{t.upload.category}</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {t.catalog.categories[cat]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="condition">{t.upload.condition}</Label>
                <Select value={condition} onValueChange={setCondition}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map(cond => (
                      <SelectItem key={cond} value={cond}>
                        {getConditionLabel(cond, t)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="price">{t.upload.price} (₼)</Label>
                <Input 
                  id="price" 
                  type="number" 
                  placeholder="0" 
                  className="mt-2" 
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>

            {/* Dimensions */}
            <div>
              <Label className="text-lg font-semibold mb-4 block">{t.upload.dimensions} (cm)</Label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="width" className="text-sm">{t.upload.width}</Label>
                  <Input 
                    id="width" 
                    type="number" 
                    placeholder="0" 
                    className="mt-1" 
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="height" className="text-sm">{t.upload.height}</Label>
                  <Input 
                    id="height" 
                    type="number" 
                    placeholder="0" 
                    className="mt-1" 
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="depth" className="text-sm">{t.upload.depth}</Label>
                  <Input 
                    id="depth" 
                    type="number" 
                    placeholder="0" 
                    className="mt-1" 
                    value={depth}
                    onChange={(e) => setDepth(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">{t.upload.description}</Label>
              <Textarea
                id="description"
                placeholder="Describe your furniture..."
                className="mt-2 min-h-[120px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Barter Toggle */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
              <div>
                <Label htmlFor="barter" className="font-semibold">{t.upload.acceptBarter}</Label>
                <p className="text-sm text-muted-foreground">
                  Allow others to propose trades
                </p>
              </div>
              <Switch
                id="barter"
                checked={acceptBarter}
                onCheckedChange={setAcceptBarter}
              />
            </div>

            {/* Submit */}
            <Button type="submit" variant="hero" size="xl" className="w-full">
              <UploadIcon className="w-5 h-5 mr-2" />
              {t.upload.submit}
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Upload;
