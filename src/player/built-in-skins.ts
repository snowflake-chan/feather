import {
  PlayerSkinHash,
  PlayerSkinHashSchema,
} from '@box/schema/player/player-schema';

/**
 * Curated, offline player skins. Every hash is the original 3D body-part
 * resource hash. The blobs and preview images are checked into the repository
 * so a release can be built without contacting BOX3 services.
 */
export type BuiltInSkin = {
  id: string;
  name: string;
  preview: string;
  sourcePreview: string;
  parts: Record<string, string>;
};

const partNames = [
  'hips', 'torso', 'neck', 'head', 'leftShoulder', 'leftUpperArm',
  'leftLowerArm', 'leftHand', 'rightShoulder', 'rightUpperArm',
  'rightLowerArm', 'rightHand', 'leftUpperLeg', 'leftLowerLeg', 'leftFoot',
  'rightUpperLeg', 'rightLowerLeg', 'rightFoot',
] as const;

function parts(values: string[]): Record<string, string> {
  return Object.fromEntries(partNames.map((part, index) => [part, values[index]]));
}

export const BUILT_IN_SKINS: readonly BuiltInSkin[] = [
  {
    id: 'explorer', name: '探险者',
    preview: '/built-in-skins/explorer.png',
    sourcePreview: '/built-in-skins/explorer.png',
    parts: parts([
      'GTuRfQ8lo5UVNwVRkX0pffhoTDLnsj_hdgCl0hFPlxk', 'L97ARUcIR9G1_lSv1c8-d_qhr-qB15A3Ew4UJ1FnhAY', 'oShx_uIQ-4YZKR6uoZRYHL0lMeSyN1nSJfaAaSP2MiI', 'XmPKwf7XjsDoYuNkjDQrWPzLIu1aTOYnby2bUmQChE4',
      'qNXdY_ukcevLHz6PfB4YebcVKm5ymKkc4RmmNACt58U', 'sOgyrN2KX2usg51tbNNxBFrJ9iPPW0CKN91A9za09Tk', '9gtCoNxXqTSG7QKR1FpbpF0ySeNvA-JMrlq17Qm-L2k', 'fFzXwES0_SIA4gtPnY1rAjJRiZ8PnP7WewMOuDzQRiE',
      'nmKC5PJeNwzmF-Idb-Jl6Iuee4aCzwAFm50SjZOB8J0', 'h4Zdd0HdCZR8aOa2FmRmBdxCLwkPDcSXAdEsUAHr0WA', 'yP1TmmOwXInzjarE0CKhGb0wrgyP8mb6cBDktdlxSIU', 'y2jNDEAVWMql33MI7A9MetZoMzoYZ3OQkfpE_ttnZpA',
      'iKKTTHOTy9iBaaozmprN83iLh2W2baZfTXuLu6uaLIw', 'p0hlunSNmKVR7psYDbGVbl2g55I_GklMquQVTtw_Hng', 'VE8cmDpuiYV41JTNf1-8p6baecUlhPX7BwCuiKjuNN0', 'DtP529xgwDaffRCOkb2XVsG6HqkPHlbcrklgpT-As_8',
      'Ehfy317KJDTCmpuXWLRcS5Ljl7CvRBnVCE4S-nr8O0M', '1Sz9b2RJLB_LTdrWxGCy_1gx051sihM7Msn1OPg1uZY',
    ]),
  },
  {
    id: 'pilot', name: '飞行员',
    preview: '/built-in-skins/pilot.png',
    sourcePreview: '/built-in-skins/pilot.png',
    parts: parts([
      'e1ZzIyGdOZxAsKAHToSr1Rohek9p9knQoE5r6bssVjQ', 'qFAdwDi7V1l1dyrzd38MX7ncFpbDXCPnrp3-ojx7uiw', 'oShx_uIQ-4YZKR6uoZRYHL0lMeSyN1nSJfaAaSP2MiI', 'BtoygkjjKTbFkCz-YqoBuYw26F6Bm6ZYGQYe_j9Ll44',
      'qNXdY_ukcevLHz6PfB4YebcVKm5ymKkc4RmmNACt58U', 'tAHLZ9uvlsTjN5iAeXczO381B2OSNJ69O95M2YYfcN8', 'j_VxLyyA8FBWp7kHniJSaxTb5A1PsoSRCgLG0Qwz6fY', '6Vv-ANt6YO7b-e8gUkS1T4eDXPeMDv3sSS1Fys_h0S8',
      'nmKC5PJeNwzmF-Idb-Jl6Iuee4aCzwAFm50SjZOB8J0', 'WnbegyWLVz-LHMQgdlz-Rv3L8knTzkcPxUSGtPegEWE', 'xiNu5A-wieB-673yUKGMq18e_Wty7auBZ5fkArWD-u4', 'F4c5IJb4dFkgAUxJ0r7Jw_U3u-k7MrpFcpkKSle-P2k',
      'vlGDb_MDYEWqVbJgC3-f3A_SWm6JuN3ZTBKlmwoDW-o', 'KvktHZAiSMrblY_XLWh_yHCtsfv3jLmqRgt-zGu2HR0', 'a0b1PSB2YTZGwTGrIhD8RDjboL-_etaKPh9XtBUNXfc', 'tsr6R4oV7j6XmTitibKMLHwONeTKJ-SZcP9pnBv4Ubk',
      'kO9_IinZ9d4EY2FmTEX6oMv2EN-sT8Xq8dcrUWt8nHA', 'MQtnqyF5NPGjICV8o3LaJkf7bVXmGCfZfcxIIoJ9JSo',
    ]),
  },
  {
    id: 'cowboy', name: '牛仔',
    preview: '/built-in-skins/cowboy.png',
    sourcePreview: '/built-in-skins/cowboy.png',
    parts: parts([
      'xyo3QwTg87Hhx0oWLkGYnrY_gDqFDPgEXhjxweay1-k', 'hH_d1ycJuEOUg5s2e78mRmVfgDMkmwgCljijPPNJWMw', 'oShx_uIQ-4YZKR6uoZRYHL0lMeSyN1nSJfaAaSP2MiI', 'zr-Gim06sJj1VyQIdDh1Kp0j8A4gfKoRjsQTHGdgcZQ',
      'qNXdY_ukcevLHz6PfB4YebcVKm5ymKkc4RmmNACt58U', 'Tm6iY1tjlBCxIFVkH6fQ6WSCGItCwgp1qhnV2MSmDAc', 'rE7gZfK-ViZf-NNWbddA9GiL8jqhZ5BZv5s6PlgoEEc', 'DJB3mDs16RuGcdOKCCjMMXwyI6p5lZrbgPjY_L6Uk7Q',
      'nmKC5PJeNwzmF-Idb-Jl6Iuee4aCzwAFm50SjZOB8J0', 'ntt0GRn7ynGaqPL4sJqRls9E0GQaxE6IYLyw_qp-B9Q', 'KpmKCcqs55T8Ge4r9qk_v9OaUSiTnb1quPj2RAHY7hU', 'bVlJLQq2KPX9d-_pggKAjN1lLNzGcDkAx8Ecd7ZZXtc',
      'FTlABwbChFrePJf9WWAYf1tVorJpT9qdgAfS0xQtxdM', '6rwaXC7s1n3549pYT9Eh_9qeBK3R_p6rKBLHt7BPcsU', 'WpRk7YsCv_Ymkrq4efmQOJJMD2pgvveZeiRTXm_ovD4', '-4Z3u_vlCPmpCRsG-tr5eLI4On13qNTpgnT-DArvjPo',
      'owSnNxCwon5FLARj6_vN93kAouq8LDotGEwNFqRx92s', 'b9aYkFSPn7bQXejl_yFahA3JjD33jl2-tn0l0LJ0SIg',
    ]),
  },
  {
    id: 'chinese-doll', name: '中国娃娃',
    preview: '/built-in-skins/chinese-doll.png',
    sourcePreview: '/built-in-skins/chinese-doll.png',
    parts: parts([
      '3wkhe7Ans_MZGGPsPTvtS7-q_pZdwHwChZJqcGH2Cr4', 'lTD6g8p4M9v6m8li59Kmmunz2L-57QYc7zPFDZ-W-Es', 'oShx_uIQ-4YZKR6uoZRYHL0lMeSyN1nSJfaAaSP2MiI', '-PwWZ9AEpzk377FQDI94jsphx1MzasVJd5s4zFZDhcU',
      'qNXdY_ukcevLHz6PfB4YebcVKm5ymKkc4RmmNACt58U', '3t4Jqs6gaJacqhnYDgqZ2vYS7JaPgRlUHB-By0rvqGI', 'dFZks4pYaRJ6kU-VDzQv6kIsFhOYZ43-wik950M_x1U', 'V5w0v22x0_urNk-w77v-F_CTuT_K8ncnQd45-WM_lWM',
      'nmKC5PJeNwzmF-Idb-Jl6Iuee4aCzwAFm50SjZOB8J0', 'jLETB0_-nLp_xpSomvdz2N82FA067ZjrydzMFDjfhkg', 'SQMg9VR2DwDmaNXhA0FfkTNdWoomRqUlZzm7LdEem0o', '5oJbXf0svH-YNSfnjXrPtuq9bY6XYa4gcagb_5a9rQc',
      'nfL8PKk7NDrnhqTH1YMqdx_3KAzzeRfhVu9K5old5ZM', '7xhQlsJCS24FVMSPcr62lAC83e5Xeg_Z77kAa2Cai3U', 'an3K4TsulJYxsVVoj8S8kyM4MrGJkz1esWCXafdBu28', 'l2Z50N8XgMp2foRaY-qCcDoJWe-xd8W2Nztv6A4mxp0',
      'IxW-SXDozs0JBS_q3CftTLVxGI1O8j63AGTBOFSv3Ck', '4EalxePRBTvHC2WVL7jWpab9vk7znXwq-tk0wZM3zAw',
    ]),
  },
  {
    id: 'pink-girl', name: '粉红女孩',
    preview: '/built-in-skins/pink-girl.png',
    sourcePreview: '/built-in-skins/pink-girl.png',
    parts: parts([
      'fY_KWg63ZqAvBXvX0edrPGD_GevpTGdOeZkcd4ami-8', '4jRcLv0pBJE9AjT8Jc9jZDDeUfc_RHzVfsJZyeMuaok', 'oShx_uIQ-4YZKR6uoZRYHL0lMeSyN1nSJfaAaSP2MiI', 'Xr1Okz2DqOdp07Npx5uH0N3LUScFDdF1hGIPsEBQW3g',
      'qNXdY_ukcevLHz6PfB4YebcVKm5ymKkc4RmmNACt58U', '5cwYkZ2jXAx4nXS0eZ4Rf6pInNuohcrZJzePgx_WkzU', 'rkXRGaG-CfvGeVCpnVMywGTvb-DH8H2YqpVJWSKXhdw', 'jDW1gLMHdMU77AL4Gpu3OFkm4Z5XOGThqoM-NNx12DY',
      'nmKC5PJeNwzmF-Idb-Jl6Iuee4aCzwAFm50SjZOB8J0', 'xfFBUN4QqGjaz3Jk20X5tqGfVP0n5pWFhCisMvNKcZw', 'LIIiMuy_uWeS45Hy_9Hvk1AihC5wguY2eGlfaMGb38k', 'N79jLwnB0Kzh14itL-F-M2fTm3-hAwATe-6AG_IIG8Y',
      'bV82dxWlxRigqf6FVABNJp5vj9zABVeYHyMlEHwlHN4', 'fw__JzWRTPb8TeUFb0yzX_RAw8HdngVnmkca_GGCwK8', 'Y3HX8Arsj45Iuy0qL7woY8qP5QF-W6pbOsNF6oos6zY', 'AfkW1bfj2sZ2x0QleyXGTAAICRTtJynxj9qYFftu0cc',
      'o0yyYt7q1aPpjzws0fy35amGvo_KZPHEnbTfUShpx3U', 'GnW35Ac04sg4J8H2mKIwAfNbtzNuVHM3TVICOTNx_jQ',
    ]),
  },
  {
    id: 'maid', name: '女仆',
    preview: '/built-in-skins/maid.png',
    sourcePreview: '/built-in-skins/maid.png',
    parts: parts([
      'f3VtPxT0ASkPa5x-e-vX_99ONPxvK_TFPCq_uxrrwb8', '17CzAKUuiO68ymvOPlXf7da1QdhU78fcsKHtC6l850k', 'oShx_uIQ-4YZKR6uoZRYHL0lMeSyN1nSJfaAaSP2MiI', 'MKXaSqTVklFqaVL1AmWCzzeOsk-pe6Nc4xU8VwH8Zlk',
      'qNXdY_ukcevLHz6PfB4YebcVKm5ymKkc4RmmNACt58U', 'e4RaMqkk8wRFTc2RbHz6BQkIrjcmYTLnE0IBySs5wFs', 'I4_DYrkbGGvsGQoptmNOn5ZVJ_ShkU-105VIJq2eXrc', 'TygomLARFBxhswYiAEi5onCeMIi6eInfdlt1GTPEzA8',
      'nmKC5PJeNwzmF-Idb-Jl6Iuee4aCzwAFm50SjZOB8J0', '3TITLhARLguVu71MnxN91pt5s8g301Ox3XPzzEbQ6bE', 'xyoDpJvOfUDsOythWBxubACAeEpJBFU6X4gD6UtWDcI', 'Px0I6b2Moqpmd_wPzbx7iIdoMo--LYwFs4vOX3DIEzE',
      'P01aphf0Yi8p9JgmbIM1cnZWdlmdXQ1IchBT0zUt8BY', '2SICLQuRD8nYoThtljS24xnVHMMaMFVQkTqT7YpUWyo', 'RD-J5rgF2xqGvZmFOoZT-DW-LMHZh9f8o9a7dgPMUlw', 'paRPXEE1Gj4n2JnW1d-qQAAECA9fmA6rWwX6cx5XFhE',
      'f6IcOLssuXmeRXHvfv8HbsBXyUVjQIX1vC1PT0l4ygs', '2re1r3Sq3BW4g_kYo-2WC_u07vNXFYEn5fhUJDmD_lA',
    ]),
  },
  {
    id: 'little-prince', name: '小王子',
    preview: '/built-in-skins/little-prince.png',
    sourcePreview: '/built-in-skins/little-prince.png',
    parts: parts([
      'RfOhWqMStI91CRsJ_fj1tKZVRgIi1xY9Ct35f49VCjI', 'Ze4mssXcrX1e7z185MAXCZRtMAtwB-zLj1GYyRcMU2c', 'oShx_uIQ-4YZKR6uoZRYHL0lMeSyN1nSJfaAaSP2MiI', 'vS95Ll6sl63_jDkyvfifk2BTVyB5WOqjStVP_QYb_Go',
      'qNXdY_ukcevLHz6PfB4YebcVKm5ymKkc4RmmNACt58U', 'aAphssqiPi93r7mAMudYFtFxRuGvLWKyikJifiacQEA', 'T7ltKgCfHRWDh8DvYWwjTLUm_jyyXGIin8YEQYezqRE', 'QkjGc5q5hFFv6nk338copZyNAOkmUxMJoXbOO3o9OFA',
      'nmKC5PJeNwzmF-Idb-Jl6Iuee4aCzwAFm50SjZOB8J0', 'LDdpinDyYwd0nQBnv1o81bQEZET_IzlYwghWyw6VG7Q', 'PvWei7AAs5UIWUPoZSq21E1abNJ7CakCZHkqq9JdD50', 'CjzpqeDMGwTW4rwJnDVa7L_-ZMPXB83GZIDbDY7cWCM',
      'IMPYtbLaJ3KYgGN0RrgUGSy2wrJhfY7DNzfhE96S_WY', 'oQQX0yM43YWL1vera6TSHhZthZgMnXNhIrGipFvG6No', 'GzV7zUemaTlJlNSuvN_A38PtKnuihTHjPpc0l5Dx_aU', 'mG9tCWEoogpQXIYE8nxwLE8c_VOcFuO_XgnaldjJQ60',
      'glwjp5nxcyvdUtzLmX3LHoRAtUny01vIlzPyRWlar6U', 'n1sBpQmApVlGP4i5qo5KJtx54zUpQsge54pcNzo-MDE',
    ]),
  },
  {
    id: 'christmas-girl', name: '圣诞女孩',
    preview: '/built-in-skins/christmas-girl.png',
    sourcePreview: '/built-in-skins/christmas-girl.png',
    parts: parts([
      'MI21yB2DhnLlllbB8CQJtTaH24CL944CDz-RSe05kqA', 'FXWQtkvKoY33JwIpKVbPNlKs542KIEbQ4INP6VknKTE', 'oShx_uIQ-4YZKR6uoZRYHL0lMeSyN1nSJfaAaSP2MiI', 'fz8YT7RQVR-jpW4u1ERGHT2GO0AhgkR7nXfypKDLHKQ',
      'qNXdY_ukcevLHz6PfB4YebcVKm5ymKkc4RmmNACt58U', 'k6DpMny-A1lfQF9IS7s6tr5zdEt1OF8JD_9z-gB8BQk', '57m8K7_P-oRkudRkii4mjK2HgQ1qRL5DSVn1JRHCrUc', 'HdmOGRHGe3rUiEAvtIPlU2-ou76v7FLYGIIKIcu_rOs',
      'nmKC5PJeNwzmF-Idb-Jl6Iuee4aCzwAFm50SjZOB8J0', 'z7PzcCMU5mgfNHEC1sglsERnwrO5r_eMXeR6zSN78Os', '0uyvWiAlEwsxmi0aHE_bJEt2Czve3sfSpfF5T-8zWEo', 'p6ltFaLV93PxC96Tfnpcsd0vZezteR3krx7rTlvhNmQ',
      'Vv6pflLQz9Z06hMF0-3GOPKmEH8ryCECiT6Wnl5tlb8', 'qkONdDiirNiCzAweq2r9YmPTM6sJo0kFnrzk-_6gpHc', 'M5L_6hoJaAVEh2olpp0jlhlE6awG_QCmAMPyuIDjY1c', '4otrUC6iqWA4J7gzPlGy9MbuPzYpYEUKcKMkaNDcRtw',
      'gHVEVf5jOoe2HepTjoZNvaPkpiFXyI-k-DGn_i7lBik', 'zBd-L4rx5mRaCLXMVzf1YNsKFxhABcx9AXlw8uEmpq8',
    ]),
  },
];

const skinsById = new Map(BUILT_IN_SKINS.map((skin) => [skin.id, skin]));

export function getBuiltInSkin(id: string | null | undefined) {
  return id ? skinsById.get(id) : undefined;
}

export function createBuiltInSkin(id: string | null | undefined): PlayerSkinHash | undefined {
  const skin = getBuiltInSkin(id);
  return skin ? PlayerSkinHashSchema.clone(skin.parts as PlayerSkinHash) : undefined;
}
