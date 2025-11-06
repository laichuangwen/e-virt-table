# Virtual Scrolling

-   By default, both rows and columns are virtual scrolling without any settings, and it can support more than 200,000 data entries.
-   The fewer cells displayed, the better the performance.
-   Even though virtualized tables are efficient, when the data load is too large, network and memory capacity can become bottlenecks for the application.

## Example

::: demo Virtual Scrolling Example

virtualScroll/base
h:700px
:::

## Dynamic Row Height

The table supports dynamic row height functionality, which can automatically adjust row height based on cell content. By setting `autoRowHeight: true` in the column configuration and providing a custom render method, you can achieve dynamic row height.

### Remember Max Row Height

When using dynamic row height functionality, horizontal scrolling may cause row height changes:

- **Problem**: When cells that expand the row height scroll out of view horizontally, the row height decreases, causing the overall scroll height to change
- **Solution**: Enable the `REMEMBER_MAX_ROW_HEIGHT` configuration

#### Configuration

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

#### API Methods

```javascript
// Clear maximum row height records (reset all row heights)
table.clearMaxRowHeight();
```

#### Usage Example

::: demo Remember Max Row Height Example

virtualScroll/remember-max-row-height
h:700px
:::

**Applicable Scenarios:**

- Table contains multiple columns requiring horizontal scrolling
- Uses dynamic row height functionality (`autoRowHeight`)
- Needs to maintain scroll position stability
- Different columns have significantly different content lengths