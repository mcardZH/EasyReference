import { EditorView, Decoration, WidgetType } from "@codemirror/view";
import { Extension } from "@codemirror/state";
import { syntaxTree } from "@codemirror/language";
import { RangeSetBuilder } from "@codemirror/state";

class SubFigureWidget extends WidgetType {
    constructor(private readonly content: string) {
        super();
    }

    toDOM() {
        const container = document.createElement("div");
        container.className = "subfigure-container";
        
        // 解析内容
        const lines = this.content.split("\n").filter(line => line.trim());
        
        const figuresDiv = document.createElement("div");
        figuresDiv.style.display = "flex";
        figuresDiv.style.justifyContent = "space-around";
        figuresDiv.style.flexWrap = "wrap";
        
        // 处理每个子图
        lines.forEach((line, index) => {
            if (line.startsWith("![")) {
                const imgContainer = document.createElement("div");
                imgContainer.style.flex = "1";
                imgContainer.style.margin = "10px";
                imgContainer.style.minWidth = "200px";
                imgContainer.style.textAlign = "center";
                
                // 提取图片信息
                const captionMatch = line.match(/!\[(.*?)\]/);
                const srcMatch = line.match(/\((.*?)\)/);
                const idMatch = line.match(/{#(.*?)}/);
                
                if (srcMatch) {
                    const img = document.createElement("img");
                    img.src = srcMatch[1];
                    img.style.maxWidth = "100%";
                    imgContainer.appendChild(img);
                }
                
                if (captionMatch) {
                    const caption = document.createElement("div");
                    caption.className = "subfigure-caption";
                    caption.textContent = captionMatch[1];
                    imgContainer.appendChild(caption);
                }
                
                if (idMatch) {
                    imgContainer.id = idMatch[1];
                }
                
                figuresDiv.appendChild(imgContainer);
            } else if (!line.startsWith("<div") && !line.startsWith("</div")) {
                // 主标题
                const mainCaption = document.createElement("div");
                mainCaption.className = "figure-caption";
                mainCaption.style.textAlign = "center";
                mainCaption.style.marginTop = "10px";
                mainCaption.textContent = line;
                container.appendChild(mainCaption);
            }
        });
        
        container.appendChild(figuresDiv);
        return container;
    }
}

export function createSubFigureExtension(): Extension {
    return EditorView.decorations.compute(["doc"], (state) => {
        const builder = new RangeSetBuilder<Decoration>();
        
        syntaxTree(state).iterate({
            enter: (node) => {
                if (node.type.name === "Document") {
                    const doc = state.doc;
                    const content = doc.toString();
                    
                    // 查找子图块
                    const regex = /<div id="fig:.*?">([\s\S]*?)<\/div>/g;
                    let match;
                    
                    while ((match = regex.exec(content)) !== null) {
                        const start = match.index;
                        const end = start + match[0].length;
                        
                        builder.add(
                            start,
                            end,
                            Decoration.replace({
                                widget: new SubFigureWidget(match[0])
                            })
                        );
                    }
                }
            }
        });
        
        return builder.finish();
    });
}
