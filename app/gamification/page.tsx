"use client";

import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cacheUtils } from "@/hooks/useCachedData";
import {
  Pet,
  ShopItem,
  InventoryItem,
  PetAction,
  StatsHeader,
  PetTab,
  ShopTab,
  InventoryTab,
  GameSection,
} from "@/components/gamification";

interface GamificationCache {
  pet: Pet | null;
  shopItems: ShopItem[];
  inventory: InventoryItem[];
  userCoins: number;
  gamePlays: number;
}

const CACHE_KEY = "gamification_data";

export default function GamificationPage() {
  // Initialize from cache for instant loading
  const cached = cacheUtils.get<GamificationCache>(CACHE_KEY);

  const [pet, setPet] = useState<Pet | null>(cached?.pet || null);
  const [shopItems, setShopItems] = useState<ShopItem[]>(cached?.shopItems || []);
  const [inventory, setInventory] = useState<InventoryItem[]>(cached?.inventory || []);
  const [userCoins, setUserCoins] = useState(cached?.userCoins || 0);
  const [gamePlays, setGamePlays] = useState(cached?.gamePlays || 0);
  const [loading, setLoading] = useState(!cached);
  const [activeTab, setActiveTab] = useState("pet");

  const fetchData = useCallback(async () => {
    try {
      // Fetch pet
      const petRes = await fetch("/api/gamification/pet");
      let newPet = null;
      if (petRes.ok) {
        const petData = await petRes.json();
        newPet = petData.pet;
        setPet(newPet);
      }

      // Fetch shop items
      const shopRes = await fetch("/api/gamification/shop");
      let newShopItems: ShopItem[] = [];
      if (shopRes.ok) {
        const shopData = await shopRes.json();
        newShopItems = shopData.items;
        setShopItems(newShopItems);
      }

      // Fetch inventory
      const inventoryRes = await fetch("/api/gamification/inventory");
      let newInventory: InventoryItem[] = [];
      let newGamePlays = 0;
      if (inventoryRes.ok) {
        const invData = await inventoryRes.json();
        newInventory = invData.inventory;
        setInventory(newInventory);
        newGamePlays = newInventory
          .filter((item: InventoryItem) => item.item.type === 'game_play')
          .reduce((sum: number, item: InventoryItem) => sum + item.quantity, 0);
        setGamePlays(newGamePlays);
      } else {
        setInventory([]);
        setGamePlays(0);
      }

      // Fetch current user coins
      const userRes = await fetch("/api/auth/me");
      let newCoins = 0;
      if (userRes.ok) {
        const userData = await userRes.json();
        newCoins = userData.user.coins;
        setUserCoins(newCoins);
      }

      // Cache all data
      cacheUtils.set<GamificationCache>(CACHE_KEY, {
        pet: newPet,
        shopItems: newShopItems,
        inventory: newInventory,
        userCoins: newCoins,
        gamePlays: newGamePlays,
      });
    } catch (error) {
      console.error("Failed to fetch gamification data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePetInteract = async (action: PetAction) => {
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

  const glassEffect = "bg-black/40 backdrop-blur-md border border-white/20 rounded-xl shadow-lg";
  const cardStyle = "bg-gradient-to-br from-gray-600/70 to-gray-700/70 backdrop-blur-md border-gray-500/30 text-white shadow-xl";

  return (
    <main className="h-screen w-screen text-white p-6">
      <div className="relative w-full h-full">
        <div className={cn(
          "absolute top-20 bottom-6 left-24 right-24 flex flex-col overflow-hidden",
          glassEffect
        )}>
          <ScrollArea className="h-full w-full p-4">
            <div className="space-y-4">
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold">Gamification</h1>
                <p className="text-muted-foreground">Quản lý thú cưng và mua sắm của bạn</p>
              </div>

              {/* Stats Header */}
              <StatsHeader
                userCoins={userCoins}
                gamePlays={gamePlays}
                pet={pet}
                cardStyle={cardStyle}
              />

              {/* Main Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="pet">Thú Cưng</TabsTrigger>
                  <TabsTrigger value="shop">Cửa Hàng</TabsTrigger>
                  <TabsTrigger value="inventory">Túi Đồ</TabsTrigger>
                </TabsList>

                {/* Pet Tab */}
                <TabsContent value="pet" className="space-y-4">
                  <PetTab
                    pet={pet}
                    onInteract={handlePetInteract}
                    cardStyle={cardStyle}
                  />
                </TabsContent>

                {/* Shop Tab */}
                <TabsContent value="shop" className="space-y-4">
                  <ShopTab
                    shopItems={shopItems}
                    userCoins={userCoins}
                    onBuyItem={handleBuyItem}
                    cardStyle={cardStyle}
                  />
                </TabsContent>

                {/* Inventory Tab */}
                <TabsContent value="inventory" className="space-y-4">
                  <InventoryTab
                    inventory={inventory}
                    cardStyle={cardStyle}
                  />
                </TabsContent>
              </Tabs>

              {/* Game Section */}
              <GameSection
                gamePlays={gamePlays}
                cardStyle={cardStyle}
                onNavigateToShop={() => setActiveTab("shop")}
              />
            </div>
          </ScrollArea>
        </div>
      </div>
    </main>
  );
}
