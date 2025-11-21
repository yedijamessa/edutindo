import * as React from "react"
import { cn } from "./button"

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
    container?: boolean
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
    ({ className, container = true, children, ...props }, ref) => {
        return (
            <section
                ref={ref}
                className={cn("py-12 md:py-16 lg:py-24", className)}
                {...props}
            >
                {container ? (
                    <div className="container-custom">{children}</div>
                ) : (
                    children
                )}
            </section>
        )
    }
)
Section.displayName = "Section"

export { Section }
