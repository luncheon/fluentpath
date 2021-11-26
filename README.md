# fluentpath

SVG freehand smooth drawing.

## Usage

```html
<script src="fluentpath/index.js"></script>

<svg data-fluentpath width="640px" height="480px"></svg>
```

## Events

- `"fluentpath:drawstart"`: Occurs when a drawing starts.
  - `event.target`: `SVGPathElement`: the drawing path
- `"fluentpath:drawend"`: Occurs when a drawing ends.
  - `event.target`: `SVGPathElement`: the drawn path
