import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';

function extractGrassPoints(content: string) {
  try {
    const jsonMatch = content.match(/\[\s*{[\s\S]*?}\s*\]/);
    if (!jsonMatch) return [];
    return JSON.parse(jsonMatch[0]) as Array<{ name: string }>;
  } catch {
    return [];
  }
}

function parseSearchResults(searchRes: unknown) {
  // 解析 web_search_preview 返回的 message.content[0].annotations
  const output = (searchRes as unknown as { output?: { choices?: Array<{ message?: unknown }> } }).output;
  const message = output?.choices?.[0]?.message || (searchRes as Record<string, unknown>)?.message;
  if (!message) return [];
  const contentArr = (message as { content?: unknown }).content as Array<Record<string, unknown>> | undefined;
  const annotations = contentArr && contentArr[0] ? contentArr[0].annotations || [] : [];
  // 只保留 url_citation 类型
  return (annotations as Array<Record<string, unknown>>)
    .filter((a) => a.type === 'url_citation')
    .map((a) => ({
      url: a.url as string,
      title: (a.title as string) || (a.url as string),
    }));
}

export async function POST(req: Request) {
  const startTime = Date.now();
  try {
    console.log('[API] /api/chat 请求收到');
    const { messages, temperature = 0.7, model = 'gpt-4o' } = await req.json();
    console.log('[API] 用户消息:', messages);

    // 从用户消息中提取最后一条输入
    const userInput = (messages as { role: string; content: string }[] | undefined)?.filter((m: { role: string; content: string }) => m.role === 'user').slice(-1)[0]?.content ?? '';

    // ====== 你的全世界种草官 system prompt ======
    const systemPrompt = `
你是一个专业且亲切的旅行种草官，专为全球年轻用户定制一日游路线。
请根据用户的语气、诉求、兴趣，自动判断本次旅程的国家、城市及风格（如文艺、美食、探店、亲子、闺蜜游等），用清单形式生成详细【一天行程表】。

要求如下：
1. 用标题描述本次旅程的风格和主题（如"东京文艺咖啡一日游"或"巴黎闺蜜时尚体验"）。
2. 行程表按时间段罗列，每一项包含【时间】【打卡/活动/餐饮点名称】【理由/亮点】【具体地址】。
3. 行程不少于3个"种草点"，并用#草点高亮。
4. 最后总结涉及的所有草点和它们的地理位置，用JSON结构化输出：
[
  {"name": "Cafe Kitsune Paris", "type": "咖啡馆", "address": "51 Galerie de Montpensier, 75001 Paris, France"},
  {"name": "Tokyo National Museum", "type": "博物馆", "address": "13-9 Uenokoen, Taito City, Tokyo 110-8712, Japan"}
]
5. 禁止编造不存在的地点，尽量用全球真实热门商家、景点、餐厅。
6. 回答风格要自然亲和，有国际化视角，可以适当加emoji和贴心tips。

用户输入如下：
${userInput}
`;

    const allMessages = [
      { role: 'system', content: systemPrompt },
      ...(messages || []),
    ];

    console.log('[API] 开始生成AI主回复');
    const completionStart = Date.now();
    const completion = await openai.chat.completions.create({
      model,
      messages: allMessages,
      temperature,
    });
    const completionEnd = Date.now();
    console.log(`[API] AI主回复生成完成，耗时${completionEnd - completionStart}ms`);

    const content = completion.choices[0].message.content;
    const contentStr = content ?? '';
    const grassPoints = extractGrassPoints(contentStr);
    console.log('[API] 提取到草点:', grassPoints);

    // 异步websearch：主回复先返回，websearch结果可由前端再查
    // const spotPosts = await Promise.all(
    //   grassPoints.slice(0, 2).map(async (point, idx) => {
    //     try {
    //       const t0 = Date.now();
    //       console.log(`[WebSearch] 开始查${point.name}`);
    //       const searchRes = await openai.responses.create({
    //         model: "gpt-4.1",
    //         tools: [{ type: "web_search_preview" }],
    //         input: `site:xiaohongshu.com ${point.name} 攻略 OR 游记 OR 笔记`
    //       });
    //       const posts = parseSearchResults(searchRes);
    //       const t1 = Date.now();
    //       console.log(`[WebSearch] ${point.name} 查完，耗时${t1 - t0}ms，结果:`, posts);
    //       return {
    //         spot: point.name,
    //         posts
    //       };
    //     } catch (err) {
    //       console.error(`[WebSearch ERROR] ${point.name}:`, err);
    //       return {
    //         spot: point.name,
    //         posts: []
    //       };
    //     }
    //   })
    // );

    // console.log('[API] spotPosts:', spotPosts);
    console.log(`[API] 总耗时: ${Date.now() - startTime}ms`);

    return NextResponse.json({
      ok: true,
      result: completion.choices[0].message,
      // spotPosts
    });
  } catch (err: unknown) {
    console.error('[API] /api/chat 异常:', err);
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
