class UsersController < ApplicationController

  def login
  end

  def classroom
    if params[:name].present?
      @username = params[:name]
      @saved = $redis.get('username')
    else
      redirect_to :root
    end
  end

  def data
    @users = $redis.lrange("users", 0, -1).uniq
  end
end
