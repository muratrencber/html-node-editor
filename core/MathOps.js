function clamp(value, min, max)
{
	if(value >= max)
        return max;
    if(value <= min)
        return min;
    return value;
}

class Vector2
{
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
    }

    Plus(otherVector)
    {
        return new Vector2(this.x+otherVector.x, this.y +otherVector.y);
    }

    Minus(otherVector)
    {
        return new Vector2(this.x-otherVector.x, this.y-otherVector.y);
    }

    Scale(factor)
    {
        return new Vector2(this.x * factor, this.y * factor);
    }

    Normalized()
    {
        let length = Math.sqrt(this.x * this.x + this.y * this.y);
        return new Vector2(this.x/length, this.y/length);
    }

    static Negative(target)
    {
        return new Vector2(-target.x, -target.y);
    }
}

class Rect
{
    constructor(topLeft, scale)
    {
        this.topLeft = topLeft;
        this.scale = scale;
    }
    SetFromRect(menuDOMRect)
    {
        this.topLeft = new Vector2(menuDOMRect.x, menuDOMRect.y);
        this.scale = new Vector2(menuDOMRect.width, menuDOMRect.height);
    }
    Center()
    {
        return this.topLeft.Plus(this.scale.Scale(1/2));
    }
    BottomRight()
    {
        return this.topLeft.Plus(this.scale);
    }
    BottomLeft()
    {
        return this.topLeft.Plus(new Vector2(0, this.scale.y));
    }
    TopRight()
    {
        return this.topLeft.Plus(new Vector2(this.scale.x, 0));
    }
    Contains(pos)
    {
        if(pos.x < this.topLeft.x || pos.x > this.BottomRight().x)
            return false;
        if(pos.y < this.topLeft.y || pos.y > this.BottomRight().y)
            return false;
        return true;
    }
    Intersects(otherRect, from)
    {
        if(otherRect.Contains(this.topLeft))
            return true;
        else if(otherRect.Contains(this.BottomRight()))
            return true;
        else if (otherRect.Contains(this.BottomLeft()))
            return true;
        else if (otherRect.Contains(this.TopRight()))
            return true;
        else if(this.Contains(otherRect.topLeft))
            return true;
        else if(this.Contains(otherRect.BottomRight()))
            return true;
        else if (this.Contains(otherRect.BottomLeft()))
            return true;
        else if (this.Contains(otherRect.TopRight()))
            return true;
        return false;
    }
}