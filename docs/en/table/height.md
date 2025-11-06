# Height

## RowData

- The hidden field `_height` in `RowData` can also adjust the height to adapt to different row height settings, default is `config.CELL_HEIGHT`
  | Parameter | Description | Type | Optional Values | Default |
  | ----- | -------- | ------ | ------ | ------ |
  | \_height | Column width | number | — | 100 |

## Config

| Parameter                 | Description                                                        | Type    | Optional Values | Default |
| -------------------- | ----------------------------------------------------------- | ------- | ------ | ------ |
| HEIGHT               | Height, 0 means adaptive                                       | number  | —      | 0      |
| MAX_HEIGHT           | Maximum height, 0 means adaptive height based on HEIGHT                    | number  | —      | 1000   |
| CELL_HEIGHT          | Default row height for body cells                                         | number  | —      | 32     |
| ENABLE_RESIZE_ROW | Enable row height adjustment | boolean | — | true |
| AUTO_ROW_HEIGHT | All rows adaptive height | boolean | false |

## Events

| Event Name        | Description          | Callback Parameters                                            |
| --------------- | ------------- | --------------------------------------------------- |
| resizeRowChange | Body adjustment callback | `({colIndex, key, oldWidth, width,column,columns})` |


## Column


| Parameter | Description     | Type                                   | Default |
| ---- | -------- | -------------------------------------- | ------ |
| maxLineClamp | Maximum overflow truncation lines, default `auto` expands based on content | `auto,number` | auto |
| autoRowHeight | Adaptive row height | boolean | false |

## Default Total Height
- `MAX_HEIGHT` is 1000
- `HEIGHT` is 0, meaning adaptive

::: demo

height/base
h:320px
:::

## Set Total Height

::: demo

height/set-height
h:445px
:::

## Maximum Total Height

- Set maximum height

::: demo

height/max-height
h:445px
:::

## Set Total Height and Maximum Total Height

- Note: setting both `HEIGHT` and `MAX_HEIGHT` to 0 means no vertical scrollbar

::: demo

height/set-max-height
h:445px
:::

## `CELL_HEIGHT` Set Row Height

- Uniformly change all row heights

::: demo

height/setting
h:320px
:::

## `_height` Set Row Height

- Can control the height of specific rows according to requirements

::: demo

height/data-setting
h:320px
:::

## Disable Row Height Adjustment
- Row height adjustment is enabled by default

::: demo

height/resize
h:350px
:::

## Adaptive Row Height
- Disabled by default
- Note: overlay dom adaptive row height needs to set domDataset
- Because the table calculates row height based on the visible area, jumping is normal
- If you don't want it to keep expanding too much, you can set maxLineClamp for truncation

::: demo

height/auto-height
h:350px
:::

## Remember Max Row Height

When using dynamic row height functionality, horizontal scrolling may cause row height changes:

- **Problem**: When cells that expand the row height scroll out of view horizontally, the row height decreases, causing the overall scroll height to change
- **Solution**: Enable the `REMEMBER_MAX_ROW_HEIGHT` configuration

### Configuration

```javascript
{
    REMEMBER_MAX_ROW_HEIGHT: true  // Remember the maximum rendered height for each row
}
```

**Features:**

1. **Per-row recording**: Uses `rowKey` to record the maximum height for each row independently
2. **Record maximum height**: The table records the maximum height that each row has ever rendered
3. **Height only increases**: During horizontal scrolling, even if tall cells scroll out of view, the row height will not decrease
4. **Expand as needed**: First render uses default row height or known maximum height, may expand later
5. **Maintain stability**: Prevents changes in overall scroll height due to horizontal scrolling
6. **Auto cleanup**: Automatically clears all maximum row height records when data is refreshed (`loadData`, `setData`)

### API Methods

```javascript
// Clear maximum row height records (reset all row heights)
table.clearMaxRowHeight();
```

### Usage Example

::: demo Remember Max Row Height Example

height/remember-max-row-height
h:700px
:::

**Applicable Scenarios:**

- Table contains multiple columns requiring horizontal scrolling
- Uses dynamic row height functionality (`autoRowHeight`)
- Needs to maintain scroll position stability
- Different columns have significantly different content lengths