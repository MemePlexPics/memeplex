import { Link } from "react-router-dom"
import * as stylex from '@stylexjs/stylex'
import { s } from "./style"

export const AboutPage = () => {
    return <div {...stylex.props(s.about)}>
        <div>
            <p {...stylex.props(s.p)}>
                <Link to='/' {...stylex.props(s.link)}>memeplex.pics</Link> - поисковая система для мемов русско- и украиноязычного нижнего телеграма.
            </p>
            <p {...stylex.props(s.p)}>Мы индексируем нишевые телеграм-каналы, которые обычно пролетают под радаром крупных индексаторов, которые к тому же, как правило, не позволяют искать кириллицей.</p>
            <p {...stylex.props(s.p)}>Наше главное отличие: мы не воруем контент, и всегда указываем ссылку на оригинал.</p>
            <p {...stylex.props(s.p)}>
                Если у вас есть телеграм-канал, вы можете рекомендовать его к добавлению <Link to='/channelList' {...stylex.props(s.link)}>здесь</Link>
                , либо же добавить его в featured channels, репостнув наш <Link to='https://t.me/memeplex_pics/4' {...stylex.props(s.link)}>анонс</Link>.
            </p>
        </div>
        {/* <span {...stylex.props(s.border)}></span>
        <div>
            <p {...stylex.props(s.p)}>
                <Link to='/' {...stylex.props(s.link)}>memeplex.pics</Link> is a meme search engine and catalogue with a focus on Russian and Ukrainian underground Telegram content.
            </p>
            <p {...stylex.props(s.p)}>We index niche telegram channels that usually fly under the radar of big meme indexers, that usually don't even allow to search content in languages other than English.</p>
            <p {...stylex.props(s.p)}>Our distinguishing feature is that we don't steal the content (there's always a link to the original).</p>
            <p {...stylex.props(s.p)}>
                If you have a telegram channel, you can suggest it <Link to='/channelList' {...stylex.props(s.link)}>here</Link>
                , or add it to "featured channels" by reposting our announcement 
                (see <Link to='https://t.me/memeplex_pics/4' {...stylex.props(s.link)}>here</Link>)
            </p>
        </div> */}
    </div>
}
