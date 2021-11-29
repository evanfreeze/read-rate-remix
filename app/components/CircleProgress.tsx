const diameter = 50;
const strokeWidth = 7;
const radius = diameter / 2 - strokeWidth / 2;
const circ = 2 * Math.PI * radius;

export type HSLColor = { h: string; s: string; l: string };

export default function CircleProgress({
    color,
    progress,
    children,
}: {
    color: HSLColor;
    progress: number;
    children?: React.ReactNode;
}) {
    // Math.max(progress, 0.01) makes sure it's always at least 1% complete so we get a dot on the circle
    const position = Math.max(1 - Math.max(progress, 0.01), 0);

    return (
        <div className="relative">
            <svg viewBox="0 0 50 50" transform="rotate(-90)">
                <circle
                    cx={diameter / 2}
                    cy={diameter / 2}
                    r={radius}
                    stroke={`hsla(${color.h}, ${color.s}, ${color.l}, 0.2)`}
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    style={{
                        strokeDasharray: circ,
                    }}
                />
                <circle
                    cx={diameter / 2}
                    cy={diameter / 2}
                    r={radius}
                    stroke={`hsl(${color.h}, ${color.s}, ${color.l})`}
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    style={{
                        strokeDasharray: circ,
                        strokeDashoffset: circ * position,
                        strokeLinecap: "round",
                    }}
                />
            </svg>
            {children && (
                <span
                    className="text-2xl font-bold w-full h-full absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center"
                    style={{ color: `hsl(${color.h}, ${color.s}, ${color.l})` }}
                >
                    {children}
                </span>
            )}
        </div>
    );
}
