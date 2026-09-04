import { TokenSearch } from "@/components/home/TokenSearch";
import { DiscoveryTabs } from "@/components/home/DiscoveryTabs";
import { discovery } from "@/lib/db/queries";
import { getEnv } from "@/config/env";
import type { RankedToken } from "@/types/token";
export const revalidate=60;
export default async function Home(){
  let newTokens:RankedToken[]=[],trending:RankedToken[]=[],volume:RankedToken[]=[];
  try{const explorer=getEnv().ROBINHOOD_EXPLORER_URL;[trending,newTokens,volume]=await Promise.all([discovery("trending",explorer),discovery("new",explorer),discovery("volume",explorer)])}catch{}
  return <main><section className="shell" style={{padding:"100px 0 78px",textAlign:"center"}}><p className="eyebrow">Robinhood Chain Intelligence</p><h1 style={{fontSize:"clamp(48px,9vw,92px)",lineHeight:.98,letterSpacing:"-.06em",margin:"20px 0"}}>See the token.<br/>Know the risk.</h1><p className="muted" style={{fontSize:18}}>Discover tokens. Analyze activity. Understand risk.</p><TokenSearch/></section><section className="shell" style={{paddingBottom:90}}><div style={{display:"flex",alignItems:"end",justifyContent:"space-between",marginBottom:18}}><div><p className="eyebrow">Discovery</p><h2 style={{margin:"8px 0 0"}}>Robinhood Chain tokens</h2></div><span className="muted" style={{fontSize:12}}>Real indexed data only</span></div><DiscoveryTabs trending={trending} newTokens={newTokens} volume={volume}/></section></main>
}
