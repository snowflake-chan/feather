export const builtInSkinOptions = [
  { id: 'explorer', name: '探险者', preview: '/built-in-skins/explorer.png' },
  { id: 'pilot', name: '飞行员', preview: '/built-in-skins/pilot.png' },
  { id: 'cowboy', name: '牛仔', preview: '/built-in-skins/cowboy.png' },
  { id: 'chinese-doll', name: '中国娃娃', preview: '/built-in-skins/chinese-doll.png' },
  { id: 'pink-girl', name: '粉红女孩', preview: '/built-in-skins/pink-girl.png' },
  { id: 'maid', name: '女仆', preview: '/built-in-skins/maid.png' },
  { id: 'little-prince', name: '小王子', preview: '/built-in-skins/little-prince.png' },
  { id: 'christmas-girl', name: '圣诞女孩', preview: '/built-in-skins/christmas-girl.png' },
] as const;

export type BuiltInSkinId = (typeof builtInSkinOptions)[number]['id'];
