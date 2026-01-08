"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bone, ToyBrick, Sparkles, Backpack, ShoppingBag, Gamepad2 } from "lucide-react";

interface Pet {
  id: string;
  name: string;
  level: number;
  experience: number;
  hunger: number;
  happiness: number;
  energy: number;
  type: string;
}

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: string;
  data?: string;
}

interface InventoryItem {
  id: string;
  itemId: string;
  item: ShopItem;
  quantity: number;
}

export default function GamificationPage() {
  const [pet, setPet] = useState<Pet | null>(null);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [userCoins, setUserCoins] = useState(0);
  const [gamePlays, setGamePlays] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pet");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch pet
      const petRes = await fetch("/api/gamification/pet");
      if (petRes.ok) {
        const petData = await petRes.json();
        setPet(petData.pet);
      }

      // Fetch shop items
      const shopRes = await fetch("/api/gamification/shop");
      if (shopRes.ok) {
        const shopData = await shopRes.json();
        setShopItems(shopData.items);
      }

      // Fetch inventory
      const inventoryRes = await fetch("/api/gamification/inventory");
      if (inventoryRes.ok) {
        const invData = await inventoryRes.json();
        setInventory(invData.inventory);
        // Calculate game plays
        const totalGamePlays = invData.inventory
          .filter((item: InventoryItem) => item.item.type === 'game_play')
          .reduce((sum: number, item: InventoryItem) => sum + item.quantity, 0);
        setGamePlays(totalGamePlays);
      } else {
        setInventory([]);
        setGamePlays(0);
      }

      // Fetch current user coins
      const userRes = await fetch("/api/me");
      if (userRes.ok) {
        const userData = await userRes.json();
        setUserCoins(userData.user.coins);
      }
    } catch (error) {
      console.error("Failed to fetch gamification data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePetInteract = async (action: "feed" | "play" | "clean") => {
    try {
      const res = await fetch("/api/gamification/pet/interact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        const data = await res.json();
        setPet(data.pet);
        if (action === "feed") {
          // Refetch inventory since food was consumed
          const inventoryRes = await fetch("/api/gamification/inventory");
          if (inventoryRes.ok) {
            const invData = await inventoryRes.json();
            setInventory(invData.inventory);
            // Update game plays if needed
            const totalGamePlays = invData.inventory
              .filter((item: InventoryItem) => item.item.type === 'game_play')
              .reduce((sum: number, item: InventoryItem) => sum + item.quantity, 0);
            setGamePlays(totalGamePlays);
          }
        }
      }
    } catch (error) {
      console.error("Failed to interact with pet:", error);
    }
  };

  const handleBuyItem = async (itemId: string) => {
    try {
      const res = await fetch("/api/gamification/shop/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });

      if (res.ok) {
        const data = await res.json();
        setUserCoins(data.balance);
        if (data.inventory) {
          setInventory(prev => [...prev.filter(i => i.itemId !== itemId), data.inventory]);
          // Update game plays if bought game_play
          if (data.inventory.item.type === 'game_play') {
            setGamePlays(prev => prev + data.inventory.quantity);
          }
        }
        if (data.petUpdated) {
          // Refresh pet data
          const petRes = await fetch("/api/gamification/pet");
          if (petRes.ok) {
            const petData = await petRes.json();
            setPet(petData.pet);
          }
        }
        // Show success message
        alert(`Successfully purchased ${data.inventory?.item.name || 'item'}!`);
      } else {
        const error = await res.json();
        alert(error.message || "Purchase failed");
      }
    } catch (error) {
      console.error("Failed to buy item:", error);
      alert("Purchase failed");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const petStats = [
    { label: "Đói", value: pet?.hunger || 0, icon: "🍖" },
    { label: "Vui", value: pet?.happiness || 0, icon: "😊" },
    { label: "Năng Lượng", value: pet?.energy || 0, icon: "⚡" },
  ];

  return (
    <ScrollArea className="h-screen">
      <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Gamification</h1>
        <p className="text-muted-foreground">Quản lý thú cưng và mua sắm của bạn</p>
      </div>

      {/* Coins Display */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Xu của bạn</p>
              <p className="text-3xl font-bold">{userCoins} 💰</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Lượt chơi game</p>
              <p className="text-3xl font-bold">{gamePlays} 🎮</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Cấp độ thú cưng</p>
              <p className="text-3xl font-bold">{pet?.level || 1} ⭐</p>
              <div className="mt-2">
                <p className="text-xs text-muted-foreground">Kinh nghiệm</p>
                <Progress value={(pet?.experience || 0) / ((pet?.level || 1) * 10) * 100} className="w-full" />
                <p className="text-xs text-muted-foreground mt-1">{pet?.experience || 0} / {(pet?.level || 1) * 10}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pet">Thú Cưng</TabsTrigger>
          <TabsTrigger value="shop">Cửa Hàng</TabsTrigger>
          <TabsTrigger value="inventory">Túi Đồ</TabsTrigger>
        </TabsList>

        {/* Pet Tab */}
        <TabsContent value="pet" className="space-y-4">
          {pet && (
            <>
              {/* Pet Avatar */}
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-7xl mb-4">
                      {pet.type === 'dog' ? '🐕' : 
                       pet.type === 'cat' ? '🐱' : 
                       pet.type === 'bird' ? '🐦' : 
                       pet.type === 'rabbit' ? '🐰' : 
                       pet.type === 'dragon' ? '🐉' : 
                       pet.type === 'unicorn' ? '🦄' : '🐾'}
                    </div>
                    <h2 className="text-2xl font-bold mb-2">{pet.name}</h2>
                    <Badge variant="outline">Level {pet.level}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Pet Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {petStats.map((stat) => (
                  <Card key={stat.label}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">
                        {stat.icon} {stat.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Progress value={stat.value} className="mb-2" />
                      <p className="text-sm text-muted-foreground">{stat.value}/100</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Interaction Buttons */}
              <div className="grid grid-cols-3 gap-4">
                <Button
                  onClick={() => handlePetInteract("feed")}
                  variant="outline"
                  className="w-full"
                >
                  🍖 Cho ăn
                </Button>
                <Button
                  onClick={() => handlePetInteract("play")}
                  variant="outline"
                  className="w-full"
                >
                  🎮 Chơi
                </Button>
                <Button
                  onClick={() => handlePetInteract("clean")}
                  variant="outline"
                  className="w-full"
                >
                  🧹 Dọn dẹp
                </Button>
              </div>
            </>
          )}
        </TabsContent>

        {/* Shop Tab */}
        <TabsContent value="shop" className="space-y-4">
          {userCoins === 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <p className="text-sm text-yellow-800">
                  Bạn cần xu để mua vật phẩm. Hãy học tập với điểm tập trung cao để kiếm xu! 
                  (1-3 xu/phút tùy theo điểm tập trung)
                </p>
              </CardContent>
            </Card>
          )}
          <ScrollArea className="h-[400px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
              {shopItems.map((item) => {
                const getItemIcon = (type: string) => {
                  switch (type) {
                    case 'pet': return '🐾';
                    case 'game_play': return '🎮';
                    case 'food': return '🍎';
                    case 'toy': return '🧸';
                    case 'decoration': return '🏠';
                    case 'background': return '🌄';
                    default: return '📦';
                  }
                };
                return (
                  <Card key={item.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{getItemIcon(item.type)} {item.name}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.description}
                          </p>
                        </div>
                        <Badge variant="secondary">{item.type}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold">{item.price} 💰</span>
                        <Button
                          onClick={() => handleBuyItem(item.id)}
                          disabled={userCoins < item.price}
                        >
                          Mua
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          {inventory.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Backpack className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Túi đồ trống. Mua vật phẩm từ cửa hàng!</p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
              {inventory.map((item) => {
                const getItemIcon = (type: string) => {
                  switch (type) {
                    case 'pet': return '🐾';
                    case 'game_play': return '🎮';
                    case 'food': return '🍎';
                    case 'toy': return '🧸';
                    case 'decoration': return '🏠';
                    case 'background': return '🌄';
                    default: return '📦';
                  }
                };
                return (
                  <Card key={item.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">
                            {getItemIcon(item.item.type)} {item.item.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {item.item.description}
                          </p>
                        </div>
                        <Badge>{item.quantity}x</Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>

      {/* Game Section */}
      {gamePlays > 0 && (
        <Card className="mt-8">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4">🎮</div>
              <h2 className="text-2xl font-bold">Sẵn sàng chơi game!</h2>
              <p className="text-muted-foreground">
                Bạn có {gamePlays} lượt chơi game. Mỗi lần chơi sẽ tiêu tốn 1 lượt.
              </p>
              <Button
                onClick={() => window.location.href = '/game'}
                size="lg"
                className="px-8 py-4 text-lg"
              >
                <Gamepad2 className="w-6 h-6 mr-2" />
                Chơi Game Ngay
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
    </ScrollArea>
  );
}
